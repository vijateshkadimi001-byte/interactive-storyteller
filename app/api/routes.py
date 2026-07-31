from fastapi import APIRouter
from fastapi import HTTPException

from app.models.story_models import (
    StoryRequest,
    StoryResponse
)

from app.services.story_service import (
    generate_story_response
)

from app.services.database_service import (
    get_story,
    get_all_stories,
    delete_story
)


router = APIRouter()


@router.post(
    "/story",
    response_model=StoryResponse
)
def create_story(
    request: StoryRequest
):

    try:

        response, story_id, choices = (
            generate_story_response(
                request.message,
                request.story_id
            )
        )

        return StoryResponse(
            story_id=story_id,
            message=response,
            choices=choices
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.get(
    "/stories"
)
def get_all_story_details():

    return get_all_stories()


@router.get(
    "/story/{story_id}"
)
def get_story_details(
    story_id: str
):

    story = get_story(
        story_id
    )

    if story is None:

        raise HTTPException(
            status_code=404,
            detail="Story not found"
        )

    return story


@router.delete(
    "/story/{story_id}"
)
def delete_story_endpoint(
    story_id: str
):

    deleted = delete_story(
        story_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Story not found"
        )

    return {
        "message": "Story deleted successfully",
        "story_id": story_id
    }