"""Cloudinary and local fallback image storage utility."""

import asyncio
import os
import uuid
from pathlib import Path
import aiofiles
import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.core.exceptions import BadRequestError


def _init_cloudinary() -> bool:
    """Initialize Cloudinary client if configuration is provided."""
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        return True
    elif settings.CLOUDINARY_URL and "cloudinary://" in settings.CLOUDINARY_URL and "<api_key>" not in settings.CLOUDINARY_URL:
        os.environ["CLOUDINARY_URL"] = settings.CLOUDINARY_URL
        cloudinary.reset_config()
        return True
    return False


def is_cloudinary_configured() -> bool:
    """Check whether valid Cloudinary credentials exist."""
    return _init_cloudinary()


def _upload_to_cloudinary_sync(file_bytes: bytes, folder: str, public_id: str | None) -> str:
    """Synchronous Cloudinary upload worker run in background thread."""
    upload_kwargs = {
        "folder": folder,
        "resource_type": "image",
        "overwrite": True,
    }
    if public_id:
        upload_kwargs["public_id"] = public_id

    result = cloudinary.uploader.upload(file_bytes, **upload_kwargs)
    return result.get("secure_url") or result.get("url")


async def upload_image(
    file_bytes: bytes,
    filename: str,
    folder: str = "globetrotter/avatars",
    public_id: str | None = None,
) -> str:
    """Upload image to Cloudinary (or local filesystem fallback) and return permanent URL."""
    # Basic size check (e.g. max 10MB)
    if len(file_bytes) > 10 * 1024 * 1024:
        raise BadRequestError("Image file size exceeds maximum limit of 10MB")

    if not file_bytes:
        raise BadRequestError("Uploaded file is empty")

    if _init_cloudinary():
        # Cloudinary cloud upload
        try:
            url = await asyncio.to_thread(_upload_to_cloudinary_sync, file_bytes, folder, public_id)
            return url
        except Exception as e:
            raise BadRequestError(f"Cloudinary upload failed: {str(e)}")

    # Local fallback storage when Cloudinary credentials are not present
    upload_dir = Path(settings.UPLOAD_DIR) / folder.replace("/", os.sep)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(filename).suffix.lower() if filename else ".jpg"
    if not ext:
        ext = ".jpg"
    saved_filename = f"{public_id or uuid.uuid4().hex}{ext}"
    target_path = upload_dir / saved_filename

    async with aiofiles.open(target_path, "wb") as f:
        await f.write(file_bytes)

    # Return relative static URL
    rel_url = f"/uploads/{folder}/{saved_filename}".replace("\\", "/")
    return rel_url
