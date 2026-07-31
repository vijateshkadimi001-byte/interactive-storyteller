from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class Story(Base):

    __tablename__ = "stories"

    story_id = Column(
        String,
        primary_key=True,
        index=True
    )

    state = Column(
        Text,
        default="{}"
    )

    conversation = Column(
        Text,
        default="[]"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )