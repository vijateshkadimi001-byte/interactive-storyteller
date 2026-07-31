from typing import Dict, List

from app.models.story_models import StoryState


conversation_memory: Dict[str, List[dict]] = {}

story_states: Dict[str, StoryState] = {}


def create_story(story_id: str) -> None:
    conversation_memory[story_id] = []
    story_states[story_id] = StoryState()


def get_story_history(story_id: str) -> List[dict]:
    return conversation_memory.get(story_id, [])


def add_message(
    story_id: str,
    role: str,
    content: str
) -> None:
    if story_id not in conversation_memory:
        conversation_memory[story_id] = []

    conversation_memory[story_id].append(
        {
            "role": role,
            "content": content
        }
    )


def get_story_state(story_id: str) -> StoryState:
    return story_states.get(
        story_id,
        StoryState()
    )


def update_story_state(
    story_id: str,
    state: StoryState
) -> None:
    story_states[story_id] = state