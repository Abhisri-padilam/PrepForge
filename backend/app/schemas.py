from datetime import datetime

from pydantic import BaseModel, EmailStr


# =====================================================
# USER
# =====================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =====================================================
# QUESTIONS
# =====================================================

class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    category: str


class QuestionResponse(BaseModel):
    id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    category: str
    created_by: int

    class Config:
        from_attributes = True


# =====================================================
# QUIZ HISTORY
# =====================================================

class QuizHistoryCreate(BaseModel):
    category: str
    total_questions: int
    correct_answers: int
    incorrect_answers: int
    score: int


class QuizHistoryResponse(BaseModel):
    id: int
    user_id: int
    category: str
    total_questions: int
    correct_answers: int
    incorrect_answers: int
    score: int
    created_at: datetime

    class Config:
        from_attributes = True