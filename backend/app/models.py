from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    questions = relationship("Question", back_populates="creator")

    quiz_history = relationship(
        "QuizHistory",
        back_populates="user"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text, nullable=False)

    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)

    correct_answer = Column(String(255), nullable=False)

    category = Column(String(100), nullable=False)

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    creator = relationship(
        "User",
        back_populates="questions"
    )


# =====================================================
# QUIZ HISTORY
# =====================================================

class QuizHistory(Base):
    __tablename__ = "quiz_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    total_questions = Column(
        Integer,
        nullable=False
    )

    correct_answers = Column(
        Integer,
        nullable=False
    )

    incorrect_answers = Column(
        Integer,
        nullable=False
    )

    score = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="quiz_history"
    )
