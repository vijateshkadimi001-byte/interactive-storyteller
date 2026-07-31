import json
import uuid

from app.models.story_models import StoryState

from app.services.llm_service import generate_ai_response
from app.services.prompt_service import build_story_prompt

from app.services.database_service import (
    create_story,
    get_story,
    update_story,
)

def generate_story_response(
    message: str,
    story_id: str | None = None
) -> tuple[str, str, list[str]]:

    # Step 1: Create a new story if no story_id exists
    if story_id is None:

        story_id = str(
            uuid.uuid4()
        )

        create_story(
            story_id
        )

        conversation = []
        current_state = StoryState()

    else:

        # Step 2: Retrieve existing story
        story = get_story(
            story_id
        )

        if story is None:

            raise ValueError(
                "Story not found"
            )

        conversation = story[
            "conversation"
        ]

        current_state = StoryState(
            **story["state"]
        )

    # Step 3: Convert conversation history to text
    # Keep only the most recent messages
    recent_conversation = conversation[-10:]

    conversation_text = ""

    for item in recent_conversation:

        conversation_text += (
           f"{item['role']}: "
           f"{item['content']}\n"
        )

    # Step 4: Convert story state to JSON
    story_state_text = json.dumps(
        current_state.model_dump(),
        indent=2
    )

    # Step 5: Build prompt
    prompt = build_story_prompt(
        user_message=message,
        conversation_history=conversation_text,
        story_state=story_state_text
    )

    # Step 6: Ask Gemini
    result = generate_ai_response(
        prompt
    )

    # Step 7: Get AI story response
    story_response = result[
        "story_response"
    ]

    # Step 7.1: Get AI-generated choices
    choices = result.get(
    "choices",
    []
    )

    # Step 8: Get updated story state
    updated_state = StoryState(
        **result["story_state"]
    )

    # Step 9: Add user message
    conversation.append(
        {
            "role": "user",
            "content": message
        }
    )

    # Step 10: Add AI response
    conversation.append(
        {
            "role": "assistant",
            "content": story_response
        }
    )

    # Step 11: Save everything to database
    update_story(
        story_id=story_id,
        state=updated_state.model_dump(),
        conversation=conversation
    )

    # Step 12: Return response
    return (
    story_response,
    story_id,
    choices
    )