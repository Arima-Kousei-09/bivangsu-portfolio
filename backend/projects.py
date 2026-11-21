
"""
Project API routes.

Provides endpoints for retrieving portfolio projects.
"""

from fastapi import APIRouter, HTTPException

from app.data.projects import PROJECTS

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


@router.get("/")
async def get_projects():
    """Return all registered projects."""
    return {
        "count": len(PROJECTS),
        "projects": PROJECTS,
    }


@router.get("/{slug}")
async def get_project(slug: str):
    """Return a single project using its slug."""

    for project in PROJECTS:
        if project["slug"] == slug:
            return project

    raise HTTPException(
        status_code=404,
        detail="Project not found.",
    )
