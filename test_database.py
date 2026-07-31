from app.database.database import SessionLocal
from app.database.models import Story


db = SessionLocal()

story = Story(
    story_id="test-story-001",
    state="{}",
    conversation="[]"
)

db.add(story)
db.commit()

print("Story saved successfully!")

db.close()