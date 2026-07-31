import json

from app.database.database import SessionLocal
from app.database.models import Story


def create_story(story_id: str):

    db = SessionLocal()

    story = Story(
        story_id=story_id,
        state=json.dumps({}),
        conversation=json.dumps([])
    )

    db.add(story)
    db.commit()

    db.close()


def get_story(story_id: str):

    db = SessionLocal()

    story = (
        db.query(Story)
        .filter(
            Story.story_id == story_id
        )
        .first()
    )

    if story is None:

        db.close()

        return None


    result = {
        "story_id": story.story_id,
        "state": json.loads(
            story.state
        ),
        "conversation": json.loads(
            story.conversation
        )
    }


    db.close()

    return result


def get_all_stories():

    db = SessionLocal()

    stories = (
        db.query(Story)
        .order_by(
            Story.created_at.desc()
        )
        .all()
    )


    result = []


    for story in stories:

        conversation = json.loads(
            story.conversation
        )


        title = "New Story"


        for message in conversation:

            if message["role"] == "user":

                title = message["content"]


                if len(title) > 40:

                    title = (
                        title[:40]
                        + "..."
                    )

                break


        result.append(
            {
                "story_id":
                    story.story_id,

                "title":
                    title
            }
        )


    db.close()

    return result


def update_story(
    story_id: str,
    state: dict,
    conversation: list
):

    db = SessionLocal()


    story = (
        db.query(Story)
        .filter(
            Story.story_id == story_id
        )
        .first()
    )


    if story:

        story.state = json.dumps(
            state
        )

        story.conversation = json.dumps(
            conversation
        )

        db.commit()


    db.close()


def delete_story(
    story_id: str
):

    db = SessionLocal()


    story = (
        db.query(Story)
        .filter(
            Story.story_id == story_id
        )
        .first()
    )


    if story is None:

        db.close()

        return False


    db.delete(story)

    db.commit()

    db.close()


    return True