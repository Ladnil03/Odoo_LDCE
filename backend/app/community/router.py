"""Community API endpoints — feed, likes, comments, moderation."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_admin
from app.auth.models import User
from app.community.schemas import (
    CommentCreate,
    CommentResponse,
    CommunityPostCreate,
    CommunityPostListResponse,
    CommunityPostResponse,
)
from app.community.service import (
    add_comment,
    create_post,
    delete_post,
    list_comments,
    list_posts,
    toggle_like,
)
from app.core.database import get_db

router = APIRouter(prefix="/community", tags=["Community"])


@router.get("/posts", response_model=CommunityPostListResponse)
async def list_posts_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    current_user: User | None = Depends(get_current_user),
) -> CommunityPostListResponse:
    """List public community posts (newest first)."""
    items, total = await list_posts(
        db, page=page, page_size=page_size, viewer=current_user
    )
    return CommunityPostListResponse(
        items=items, total=total, page=page, page_size=page_size
    )


@router.post("/posts", response_model=CommunityPostResponse, status_code=201)
async def create_post_endpoint(
    data: CommunityPostCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> CommunityPostResponse:
    """Publish a trip to the community feed."""
    post = await create_post(db, data, user)
    # Reload with author eagerly loaded
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.community.models import CommunityPost

    reloaded = (
        await db.execute(
            select(CommunityPost)
            .options(selectinload(CommunityPost.author))
            .where(CommunityPost.id == post.id)
        )
    ).scalar_one()

    from app.community.service import _post_to_response
    return _post_to_response(reloaded, liked_by_me=False)


@router.delete("/posts/{post_id}", status_code=204)
async def delete_post_endpoint(
    post_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete a post (author or admin)."""
    await delete_post(db, post_id, user)


@router.post("/posts/{post_id}/like")
async def toggle_like_endpoint(
    post_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """Toggle the current user's like on a post."""
    liked, count = await toggle_like(db, post_id, user)
    return {"liked": liked, "likes_count": count}


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments_endpoint(
    post_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[CommentResponse]:
    """List comments on a post."""
    return await list_comments(db, post_id)


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=201,
)
async def add_comment_endpoint(
    post_id: uuid.UUID,
    data: CommentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> CommentResponse:
    """Add a comment to a post."""
    return await add_comment(db, post_id, data, user)
