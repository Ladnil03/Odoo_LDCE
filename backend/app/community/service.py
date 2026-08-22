"""Business logic for community posts, likes, comments."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.community.models import CommunityComment, CommunityPost, CommunityPostLike
from app.community.schemas import (
    CommentCreate,
    CommentResponse,
    CommunityPostCreate,
    CommunityPostResponse,
    AuthorBrief,
)
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.trips.models import Trip


def _author_brief(user: User, location: str | None = None) -> AuthorBrief:
    """Build an AuthorBrief from a User (verified = admin)."""
    return AuthorBrief(
        id=user.id,
        name=user.name,
        avatar_url=user.avatar_url,
        location=location,
        verified=(user.role == "admin"),
    )


def _post_to_response(
    post: CommunityPost, liked_by_me: bool = False
) -> CommunityPostResponse:
    """Convert a CommunityPost ORM instance to its response model."""
    tags = [t for t in (post.tags or "").split(",") if t] if post.tags else []
    return CommunityPostResponse(
        id=post.id,
        trip_id=post.trip_id,
        title=post.title,
        summary=post.summary,
        destination=post.destination,
        country=post.country,
        cover_image=post.cover_image,
        tags=tags,
        days_duration=post.days_duration,
        budget_total=post.budget_total,
        likes_count=post.likes_count,
        comments_count=post.comments_count,
        shares_count=post.shares_count,
        clones_count=post.clones_count,
        is_published=post.is_published,
        created_at=post.created_at,
        author=_author_brief(post.author) if post.author else AuthorBrief(
            id=uuid.UUID(int=0), name="Unknown"
        ),
        liked_by_me=liked_by_me,
    )


def _comment_to_response(comment: CommunityComment) -> CommentResponse:
    """Convert a CommunityComment ORM instance to its response model."""
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        body=comment.body,
        created_at=comment.created_at,
        author=_author_brief(comment.author) if comment.author else AuthorBrief(
            id=uuid.UUID(int=0), name="Unknown"
        ),
    )


# ── Posts ──

async def create_post(
    db: AsyncSession, data: CommunityPostCreate, user: User
) -> CommunityPost:
    """Create a community post. The trip must be owned by the user."""
    trip = await db.execute(select(Trip).where(Trip.id == data.trip_id))
    trip_obj = trip.scalar_one_or_none()
    if trip_obj is None:
        raise NotFoundError("Trip")
    if trip_obj.owner_id != user.id:
        raise ForbiddenError("You can only post your own trips")

    post = CommunityPost(
        id=uuid.uuid4(),
        trip_id=data.trip_id,
        author_id=user.id,
        title=data.title,
        summary=data.summary,
        destination=data.destination,
        country=data.country,
        cover_image=data.cover_image or trip_obj.cover_photo,
        tags=",".join(t for t in data.tags if t) or None,
        days_duration=data.days_duration,
        budget_total=data.budget_total,
    )
    db.add(post)
    await db.flush()
    return post


async def list_posts(
    db: AsyncSession,
    *,
    page: int = 1,
    page_size: int = 20,
    viewer: User | None = None,
) -> tuple[list[CommunityPostResponse], int]:
    """List published community posts, newest first."""
    total = (
        await db.execute(
            select(func.count(CommunityPost.id)).where(CommunityPost.is_published.is_(True))
        )
    ).scalar_one()

    rows = (
        await db.execute(
            select(CommunityPost)
            .options(selectinload(CommunityPost.author))
            .where(CommunityPost.is_published.is_(True))
            .order_by(CommunityPost.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    liked_ids: set[uuid.UUID] = set()
    if viewer and rows:
        post_ids = [r.id for r in rows]
        liked_rows = await db.execute(
            select(CommunityPostLike.post_id).where(
                CommunityPostLike.user_id == viewer.id,
                CommunityPostLike.post_id.in_(post_ids),
            )
        )
        liked_ids = {r[0] for r in liked_rows.all()}

    items = [_post_to_response(p, liked_by_me=(p.id in liked_ids)) for p in rows]
    return items, total


async def delete_post(
    db: AsyncSession, post_id: uuid.UUID, user: User
) -> None:
    """Delete a post (author or admin)."""
    post = (
        await db.execute(
            select(CommunityPost).where(CommunityPost.id == post_id)
        )
    ).scalar_one_or_none()
    if post is None:
        raise NotFoundError("Post")
    if post.author_id != user.id and user.role != "admin":
        raise ForbiddenError("You can only delete your own posts")
    await db.delete(post)
    await db.flush()


# ── Likes ──

async def toggle_like(
    db: AsyncSession, post_id: uuid.UUID, user: User
) -> tuple[bool, int]:
    """Toggle a like on a post. Returns (liked, new_like_count)."""
    post = (
        await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    ).scalar_one_or_none()
    if post is None:
        raise NotFoundError("Post")

    existing = (
        await db.execute(
            select(CommunityPostLike).where(
                CommunityPostLike.post_id == post_id,
                CommunityPostLike.user_id == user.id,
            )
        )
    ).scalar_one_or_none()

    if existing is not None:
        await db.delete(existing)
        post.likes_count = max(0, post.likes_count - 1)
        await db.flush()
        return (False, post.likes_count)

    db.add(CommunityPostLike(
        id=uuid.uuid4(),
        post_id=post_id,
        user_id=user.id,
    ))
    post.likes_count += 1
    await db.flush()
    return (True, post.likes_count)


# ── Comments ──

async def add_comment(
    db: AsyncSession, post_id: uuid.UUID, data: CommentCreate, user: User
) -> CommentResponse:
    """Add a comment to a post."""
    post = (
        await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    ).scalar_one_or_none()
    if post is None:
        raise NotFoundError("Post")

    comment = CommunityComment(
        id=uuid.uuid4(),
        post_id=post_id,
        author_id=user.id,
        body=data.body.strip(),
    )
    db.add(comment)
    post.comments_count += 1
    await db.flush()

    # Reload with author eagerly loaded
    reloaded = (
        await db.execute(
            select(CommunityComment)
            .options(selectinload(CommunityComment.author))
            .where(CommunityComment.id == comment.id)
        )
    ).scalar_one()
    return _comment_to_response(reloaded)


async def list_comments(
    db: AsyncSession, post_id: uuid.UUID
) -> list[CommentResponse]:
    """List comments on a post, oldest first."""
    rows = (
        await db.execute(
            select(CommunityComment)
            .options(selectinload(CommunityComment.author))
            .where(CommunityComment.post_id == post_id)
            .order_by(CommunityComment.created_at.asc())
        )
    ).scalars().all()
    return [_comment_to_response(c) for c in rows]
