from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app import models
from app.schemas import (
    UserCreate,
    UserLogin,
    QuestionCreate,
    QuestionResponse,
    QuizHistoryCreate,
    QuizHistoryResponse
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)


# ==================================================
# APP
# ==================================================

app = FastAPI(
    title="PrepForge API",
    description="Prepare. Practice. Get Hired.",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://prepforge-frontend-wkmw.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# DATABASE TABLES
# ==================================================

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database table check:", e)


# ==================================================
# DATABASE SESSION
# ==================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to PrepForge",
        "tagline": "Prepare. Practice. Get Hired."
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "PrepForge backend is running"
    }


# ==================================================
# AUTHENTICATION
# ==================================================


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

@app.post("/api/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.post("/api/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT
    access_token = create_access_token(
        data={
            "sub": str(existing_user.id)
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email
    }


# --------------------------------------------------
# PROFILE
# --------------------------------------------------

@app.get("/api/profile")
def get_profile(
    current_user=Depends(get_current_user)
):

    return {
        "message": "Profile accessed successfully",
        "user_id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


# ==================================================
# QUESTIONS
# ==================================================


# --------------------------------------------------
# CREATE QUESTION
# --------------------------------------------------

@app.post(
    "/api/questions",
    response_model=QuestionResponse
)
def create_question(
    question: QuestionCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_question = models.Question(
        question=question.question,
        option_a=question.option_a,
        option_b=question.option_b,
        option_c=question.option_c,
        option_d=question.option_d,
        correct_answer=question.correct_answer,
        category=question.category,
        created_by=current_user.id
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question


# --------------------------------------------------
# GET ALL QUESTIONS
# --------------------------------------------------

@app.get("/api/questions")
def get_questions(
    db: Session = Depends(get_db)
):

    questions = db.query(models.Question).all()

    return questions


# --------------------------------------------------
# GET ONE QUESTION
# --------------------------------------------------

@app.get("/api/questions/{question_id}")
def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):

    question = (
        db.query(models.Question)
        .filter(models.Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    return question


# --------------------------------------------------
# UPDATE QUESTION
# --------------------------------------------------

@app.put("/api/questions/{question_id}")
def update_question(
    question_id: int,
    question_data: QuestionCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    question = (
        db.query(models.Question)
        .filter(models.Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    # Only creator can update
    if question.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can update only your own questions"
        )

    question.question = question_data.question
    question.option_a = question_data.option_a
    question.option_b = question_data.option_b
    question.option_c = question_data.option_c
    question.option_d = question_data.option_d
    question.correct_answer = question_data.correct_answer
    question.category = question_data.category

    db.commit()
    db.refresh(question)

    return {
        "message": "Question updated successfully",
        "question": question
    }


# --------------------------------------------------
# DELETE QUESTION
# --------------------------------------------------

@app.delete("/api/questions/{question_id}")
def delete_question(
    question_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    question = (
        db.query(models.Question)
        .filter(models.Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    # Only creator can delete
    if question.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can delete only your own questions"
        )

    db.delete(question)
    db.commit()

    return {
        "message": "Question deleted successfully"
    }


# ==================================================
# QUIZ HISTORY
# ==================================================


# --------------------------------------------------
# SAVE QUIZ RESULT
# --------------------------------------------------

@app.post(
    "/api/history",
    response_model=QuizHistoryResponse
)
def save_quiz_history(
    history: QuizHistoryCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Validate total questions
    if history.total_questions <= 0:
        raise HTTPException(
            status_code=400,
            detail="Total questions must be greater than 0"
        )

    # Validate correct answers
    if history.correct_answers < 0:
        raise HTTPException(
            status_code=400,
            detail="Correct answers cannot be negative"
        )

    # Validate incorrect answers
    if history.incorrect_answers < 0:
        raise HTTPException(
            status_code=400,
            detail="Incorrect answers cannot be negative"
        )

    # Validate answer count
    if (
        history.correct_answers +
        history.incorrect_answers
        > history.total_questions
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid quiz result"
        )

    # Calculate score
    score = round(
        (
            history.correct_answers /
            history.total_questions
        ) * 100
    )

    # Create history record
    new_history = models.QuizHistory(
        user_id=current_user.id,
        category=history.category or "Mixed Practice",
        total_questions=history.total_questions,
        correct_answers=history.correct_answers,
        incorrect_answers=history.incorrect_answers,
        score=score
    )

    # Save to database
    try:
        db.add(new_history)
        db.commit()
        db.refresh(new_history)

    except Exception as e:
        db.rollback()

        print("========================================")
        print("QUIZ HISTORY DATABASE ERROR:")
        print(e)
        print("========================================")

        raise HTTPException(
            status_code=500,
            detail="Could not save quiz history"
        )

    return new_history


# --------------------------------------------------
# GET CURRENT USER QUIZ HISTORY
# --------------------------------------------------

@app.get(
    "/api/history",
    response_model=list[QuizHistoryResponse]
)
def get_quiz_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    history = (
        db.query(models.QuizHistory)
        .filter(
            models.QuizHistory.user_id == current_user.id
        )
        .order_by(
            models.QuizHistory.created_at.desc()
        )
        .all()
    )

    return history