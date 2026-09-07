import re

from fastapi.middleware.cors import CORSMiddleware

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from sqlalchemy.orm import Session

from sqlalchemy import func

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
import io
import re

from pypdf import PdfReader
from docx import Document

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


# ==================================================
# JD BASED PRACTICE
# ==================================================

@app.post("/api/jd-practice")
def jd_based_practice(
    data: dict,
    db: Session = Depends(get_db)
):

    jd_text = data.get("job_description", "")

    if not jd_text or not jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description is required"
        )

    jd_text = jd_text.lower()

    skill_keywords = {
        "Python": [
            "python"
        ],

        "Java": [
            "java"
        ],

        "JavaScript": [
            "javascript",
            "js"
        ],

        "React": [
            "react",
            "react.js",
            "reactjs"
        ],

        "HTML": [
            "html"
        ],

        "CSS": [
            "css"
        ],

        "SQL": [
            "sql",
            "mysql",
            "postgresql",
            "database"
        ],

        "DSA": [
            "dsa",
            "data structures",
            "algorithms",
            "problem solving"
        ],

        "Aptitude": [
            "aptitude",
            "quantitative aptitude",
            "logical reasoning",
            "reasoning"
        ]
    }

    detected_skills = []

    for skill, keywords in skill_keywords.items():

        for keyword in keywords:

            pattern = r"\b" + re.escape(keyword) + r"\b"

            if re.search(pattern, jd_text):
                detected_skills.append(skill)
                break

    detected_skills = list(dict.fromkeys(detected_skills))

    if not detected_skills:
        return {
            "message": "No supported skills detected",
            "skills": [],
            "questions": []
        }

    questions = (
        db.query(models.Question)
        .filter(
            models.Question.category.in_(detected_skills)
        )
        .order_by(func.random())
        .limit(10)
        .all()
    )

    return {
        "message": "JD based questions generated successfully",
        "skills": detected_skills,
        "questions": questions
    }
# ==================================================
# RESUME ATS SCORE
# ==================================================

@app.post("/api/resume/ats")
async def resume_ats_score(
    resume: UploadFile = File(...),
    job_description: str = Form("")
):

    # -----------------------------------------------
    # CHECK FILE
    # -----------------------------------------------

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required"
        )

    filename = resume.filename.lower()

    if not filename.endswith((".pdf", ".docx")):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resumes are supported"
        )

    file_content = await resume.read()

    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Resume must be smaller than 5 MB"
        )

    # -----------------------------------------------
    # EXTRACT RESUME TEXT
    # -----------------------------------------------

    try:

        if filename.endswith(".pdf"):

            reader = PdfReader(
                io.BytesIO(file_content)
            )

            text = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )

        else:

            document = Document(
                io.BytesIO(file_content)
            )

            text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
            )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Unable to read the resume"
        )

    text = text.strip()

    if not text:

        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the resume"
        )

    text_lower = text.lower()

    # -----------------------------------------------
    # INITIAL VALUES
    # -----------------------------------------------

    score = 0

    strengths = []

    suggestions = []

    # -----------------------------------------------
    # CONTACT INFORMATION
    # -----------------------------------------------

    contact_score = 0

    if re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text
    ):

        contact_score += 5

        strengths.append(
            "Email address found"
        )

    if re.search(
        r"\b\d{10}\b",
        text
    ):

        contact_score += 5

        strengths.append(
            "Phone number found"
        )

    if (
        "linkedin.com" in text_lower
        or "github.com" in text_lower
    ):

        contact_score += 5

        strengths.append(
            "Professional profile links found"
        )

    score += contact_score

    if contact_score < 15:

        suggestions.append(
            "Add complete contact information including email, phone, LinkedIn and GitHub."
        )

    # -----------------------------------------------
    # RESUME SECTIONS
    # -----------------------------------------------

    sections = {

        "Education": [
            "education",
            "academic"
        ],

        "Skills": [
            "skills",
            "technical skills",
            "technologies"
        ],

        "Projects": [
            "projects",
            "project experience"
        ],

        "Experience": [
            "experience",
            "work experience",
            "internship"
        ],

        "Certifications": [
            "certifications",
            "certificates"
        ]
    }

    section_score = 0

    for section, keywords in sections.items():

        found = any(
            keyword in text_lower
            for keyword in keywords
        )

        if found:

            section_score += 4

            strengths.append(
                f"{section} section detected"
            )

        else:

            suggestions.append(
                f"Consider adding a {section} section."
            )

    score += min(
        section_score,
        20
    )

    # -----------------------------------------------
    # TECHNICAL SKILLS
    # -----------------------------------------------

    common_skills = [

        "python",
        "java",
        "javascript",
        "react",
        "html",
        "css",
        "sql",
        "mysql",
        "postgresql",

        "git",
        "github",

        "fastapi",
        "django",
        "flask",

        "node.js",
        "nodejs",

        "mongodb",

        "docker",
        "aws",

        "rest api",
        "api",

        "data structures",
        "algorithms"
    ]

    detected_skills = []

    for skill in common_skills:

        if skill in text_lower:

            detected_skills.append(
                skill
            )

    skill_score = min(
        len(detected_skills) * 2,
        20
    )

    score += skill_score

    if detected_skills:

        strengths.append(
            f"{len(detected_skills)} technical skills detected"
        )

    else:

        suggestions.append(
            "Add relevant technical skills to your resume."
        )

    # -----------------------------------------------
    # ACTION VERBS
    # -----------------------------------------------

    action_verbs = [

        "developed",
        "created",
        "implemented",
        "designed",
        "built",
        "optimized",
        "improved",
        "managed",
        "analyzed",
        "automated",
        "integrated",
        "deployed"
    ]

    action_count = sum(
        text_lower.count(verb)
        for verb in action_verbs
    )

    if action_count >= 5:

        score += 10

        strengths.append(
            "Strong action-oriented language detected"
        )

    elif action_count >= 2:

        score += 5

        suggestions.append(
            "Use more strong action verbs in project and experience descriptions."
        )

    else:

        suggestions.append(
            "Use action verbs such as developed, implemented, designed and optimized."
        )

    # -----------------------------------------------
    # QUANTIFIED ACHIEVEMENTS
    # -----------------------------------------------

    numbers = re.findall(
        r"\b\d+(?:\.\d+)?%?\b",
        text
    )

    if len(numbers) >= 5:

        score += 10

        strengths.append(
            "Resume contains measurable achievements"
        )

    elif len(numbers) >= 2:

        score += 5

        suggestions.append(
            "Add more measurable results such as percentages, time saved or performance improvements."
        )

    else:

        suggestions.append(
            "Add quantified achievements to make your resume stronger."
        )

    # -----------------------------------------------
    # RESUME LENGTH
    # -----------------------------------------------

    word_count = len(
        re.findall(
            r"\b\w+\b",
            text
        )
    )

    if 300 <= word_count <= 1200:

        score += 10

        strengths.append(
            "Resume length is ATS-friendly"
        )

    elif word_count < 300:

        score += 4

        suggestions.append(
            "Your resume appears too short. Add relevant projects, skills or achievements."
        )

    else:

        score += 6

        suggestions.append(
            "Consider reducing unnecessary content and keeping the resume concise."
        )

    # -----------------------------------------------
    # JD MATCHING
    # -----------------------------------------------

    jd_match_score = None

    matched_keywords = []

    missing_keywords = []

    if job_description.strip():

        jd_lower = job_description.lower()

        jd_skill_keywords = [

            "python",
            "java",
            "javascript",
            "react",
            "html",
            "css",
            "sql",
            "mysql",
            "postgresql",
            "git",
            "github",
            "fastapi",
            "django",
            "flask",
            "node.js",
            "nodejs",
            "mongodb",
            "docker",
            "aws",
            "rest api",
            "data structures",
            "algorithms",
            "problem solving"
        ]

        jd_skills = []

        for skill in jd_skill_keywords:

            if skill in jd_lower:

                jd_skills.append(
                    skill
                )

        for skill in jd_skills:

            if skill in text_lower:

                matched_keywords.append(
                    skill
                )

            else:

                missing_keywords.append(
                    skill
                )

        if jd_skills:

            jd_match_score = round(
                (
                    len(matched_keywords)
                    /
                    len(jd_skills)
                ) * 100
            )

            if missing_keywords:

                suggestions.append(
                    "Add relevant keywords from the job description where they genuinely match your experience."
                )

    # -----------------------------------------------
    # FINAL SCORE
    # -----------------------------------------------

    score = min(
        score,
        100
    )

    # -----------------------------------------------
    # RETURN RESULT
    # -----------------------------------------------

    return {

        "filename": resume.filename,

        "ats_score": score,

        "jd_match_score": jd_match_score,

        "word_count": word_count,

        "detected_skills": detected_skills,

        "matched_keywords": matched_keywords,

        "missing_keywords": missing_keywords,

        "strengths": strengths,

        "suggestions": suggestions
    }