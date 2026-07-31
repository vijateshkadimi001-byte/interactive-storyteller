from pydantic import BaseModel, Field


class StoryRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000
    )

    story_id: str | None = None


class StoryState(BaseModel):
    location: str = ""
    character: str = ""
    inventory: list[str] = []
    current_objective: str = ""
    important_characters: list[str] = []


class StoryResponse(BaseModel):
    story_id: str
    message: str
    choices: list[str] = []