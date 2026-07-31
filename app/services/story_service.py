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

    # Step 1: Handle existing story
    if story_id is not None:

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

        is_new_story = False

    else:

        # New story exists only in memory
        # until AI successfully responds

        story_id = str(
            uuid.uuid4()
        )

        conversation = []

        current_state = StoryState()

        is_new_story = True


    # Step 2: Get recent conversation
    recent_conversation = conversation[-10:]


    # Step 3: Convert conversation to text
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


    # Step 7: Get AI response
    story_response = result[
        "story_response"
    ]


    # Step 8: Get choices
    choices = result.get(
        "choices",
        []
    )


    # Step 9: Get updated story state
    updated_state = StoryState(
        **result["story_state"]
    )


    # Step 10: Add user message
    conversation.append(
        {
            "role": "user",
            "content": message
        }
    )


    # Step 11: Add AI response
    conversation.append(
        {
            "role": "assistant",
            "content": story_response
        }
    )


    # Step 12: Create database record
    # Only after successful AI response

    if is_new_story:

        create_story(
            story_id
        )


    # Step 13: Save updated story
    update_story(
        story_id=story_id,
        state=updated_state.model_dump(),
        conversation=conversation
    )


    # Step 14: Return story, ID and choices
    return (
        story_response,
        story_id,
        choices
    )