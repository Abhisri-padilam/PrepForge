import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import LandingPage from "./LandingPage";

const API_URL = "https://prepforge-70ga.onrender.com";

function App() {
  // =========================================================
  // LANDING PAGE
  // =========================================================

  const [showLanding, setShowLanding] = useState(true);

  const handleLandingClick = () => {
    setShowLanding(false);
  };

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") ||
    !!localStorage.getItem("access_token")
  );

  const [showRegister, setShowRegister] = useState(false);

  // =========================================================
  // USER / PROFILE
  // =========================================================

  const [participantName, setParticipantName] =
    useState("Participant");

  const [profile, setProfile] = useState({
    user_id: "",
    name: "Participant",
    email: "",
  });

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activeSection, setActiveSection] =
    useState("practice");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // =========================================================
  // QUESTIONS
  // =========================================================

  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [answers, setAnswers] = useState({});

  const [score, setScore] = useState(0);

  const [submitted, setSubmitted] =
    useState(false);

  const [quizFinished, setQuizFinished] =
    useState(false);

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // CELEBRATION
  // =========================================================

  const [showCelebration, setShowCelebration] =
    useState(false);

  const [isCorrect, setIsCorrect] =
    useState(false);

  // =========================================================
  // TIMER
  // =========================================================

  const [timeLeft, setTimeLeft] = useState(30);

  // =========================================================
  // HISTORY
  // =========================================================

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "prepforge_history"
        ) || "[]"
      );
    } catch {
      return [];
    }
  });

  // =========================================================
  // LOGIN SUCCESS
  // =========================================================

  const handleLoginSuccess = (userData) => {
    if (userData?.name) {
      setParticipantName(userData.name);

      setProfile({
        user_id: userData.user_id || "",
        name: userData.name,
        email: userData.email || "",
      });
    }

    setIsAuthenticated(true);
    setActiveSection("practice");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");

    setIsAuthenticated(false);
    setShowRegister(false);

    setParticipantName("Participant");

    setProfile({
      user_id: "",
      name: "Participant",
      email: "",
    });

    setHistory([]);
  };

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      if (!token) {
        setProfileError(
          "Please login to view your profile."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Unable to fetch profile"
        );
      }

      const data = await response.json();

      setProfile({
        user_id: data.user_id ?? "",
        name: data.name ?? "Participant",
        email: data.email ?? "",
      });

      if (data.name) {
        setParticipantName(data.name);
      }
    } catch (err) {
      console.error(
        "Profile error:",
        err
      );

      setProfileError(
        err.message ||
          "Unable to load profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================================
  // FETCH QUESTIONS
  // =========================================================

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/questions`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load questions"
        );
      }

      const data = await response.json();

      setQuestions(data);
      setAllQuestions(data);

      setLoading(false);
    } catch (err) {
      console.error(err);

      setError(
        "Cannot connect to the backend"
      );

      setLoading(false);
    }
  };

  // =========================================================
  // FETCH HISTORY FROM BACKEND
  // =========================================================

  const fetchHistory = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load quiz history"
        );
      }

      const data = await response.json();

      const formattedHistory = data.map(
        (item) => ({
          id: item.id,

          name:
            participantName ||
            profile.name ||
            "Participant",

          score: item.correct_answers,

          total: item.total_questions,

          percentage:
            item.total_questions > 0
              ? Math.round(
                  (item.correct_answers /
                    item.total_questions) *
                    100
                )
              : 0,

          attempted:
            item.correct_answers +
            item.incorrect_answers,

          correct: item.correct_answers,

          incorrect: item.incorrect_answers,

          category:
            item.category || "Mixed",

          date: new Date(
            item.created_at
          ).toLocaleString(),
        })
      );

      setHistory(formattedHistory);

      localStorage.setItem(
        "prepforge_history",
        JSON.stringify(formattedHistory)
      );
    } catch (err) {
      console.error(
        "History fetch error:",
        err
      );
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchQuestions();
  }, []);

  // =========================================================
  // FETCH PROFILE AFTER LOGIN
  // =========================================================

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchHistory();
    }
  }, [isAuthenticated]);

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (
      loading ||
      quizFinished ||
      submitted ||
      activeSection !== "practice" ||
      questions.length === 0
    ) {
      return;
    }

    if (timeLeft <= 0) {
      submitAnswer();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    timeLeft,
    loading,
    quizFinished,
    submitted,
    questions.length,
    activeSection,
  ]);

  // =========================================================
  // CURRENT QUESTION
  // =========================================================

  const question =
    questions[currentQuestion];

  // =========================================================
  // ANSWER
  // =========================================================

  const handleAnswer = (answer) => {
    if (submitted) {
      return;
    }

    setSelectedAnswer(answer);
  };

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  const submitAnswer = () => {
    if (!question || submitted) {
      return;
    }

    if (!selectedAnswer) {
      alert(
        "Please select an answer first!"
      );
      return;
    }

    const correct =
      selectedAnswer ===
      question.correct_answer;

    setIsCorrect(correct);
    setSubmitted(true);

    setAnswers((previous) => ({
      ...previous,
      [question.id]: selectedAnswer,
    }));

    if (correct) {
      setScore(
        (previous) => previous + 1
      );

      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
      }, 1800);
    }
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const nextQuestion = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      setSelectedAnswer(
        answers[
          questions[
            currentQuestion + 1
          ]?.id
        ] || ""
      );

      setSubmitted(false);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  // =========================================================
  // PREVIOUS QUESTION
  // =========================================================

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );

      setSelectedAnswer(
        answers[
          questions[
            currentQuestion - 1
          ]?.id
        ] || ""
      );

      setSubmitted(
        !!answers[
          questions[
            currentQuestion - 1
          ]?.id
        ]
      );

      setTimeLeft(30);
    }
  };

  // =========================================================
  // QUESTION NAVIGATOR
  // =========================================================

  const goToQuestion = (index) => {
    setCurrentQuestion(index);

    const previousAnswer =
      answers[
        questions[index]?.id
      ];

    setSelectedAnswer(
      previousAnswer || ""
    );

    setSubmitted(
      !!previousAnswer
    );

    setTimeLeft(30);
  };

  // =========================================================
  // SAVE HISTORY
  // =========================================================

  const saveQuizHistory = async () => {
    const correctAnswers =
      Object.keys(answers).filter(
        (id) => {
          const q =
            questions.find(
              (item) =>
                item.id === Number(id)
            );

          return (
            q &&
            answers[id] ===
              q.correct_answer
          );
        }
      ).length;

    const attempted =
      Object.keys(answers).length;

    const incorrect =
      attempted - correctAnswers;

    const percentage =
      questions.length > 0
        ? Math.round(
            (correctAnswers /
              questions.length) *
              100
          )
        : 0;

    const category =
      selectedCategory === "All"
        ? "Mixed"
        : selectedCategory;

    // --------------------------------------------
    // GET LOGIN TOKEN
    // --------------------------------------------

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (!token) {
      alert(
        "Please login before completing a quiz."
      );
      return;
    }

    // --------------------------------------------
    // SAVE TO FASTAPI + MYSQL
    // --------------------------------------------

    try {
      const response = await fetch(
        `${API_URL}/api/history`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            category: category,

            total_questions:
              questions.length,

            correct_answers:
              correctAnswers,

            incorrect_answers:
              incorrect,

            score: percentage,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Failed to save quiz history"
        );
      }

      const savedHistory =
        await response.json();

      console.log(
        "Quiz history saved:",
        savedHistory
      );

      // --------------------------------------------
      // UPDATE FRONTEND HISTORY
      // --------------------------------------------

      const result = {
        id: savedHistory.id,

        name:
          participantName ||
          profile.name ||
          "Participant",

        score: correctAnswers,

        total: questions.length,

        percentage: percentage,

        attempted: attempted,

        correct: correctAnswers,

        incorrect: incorrect,

        category: category,

        date: new Date(
          savedHistory.created_at
        ).toLocaleString(),
      };

      setHistory(
        (previous) => {
          const newHistory = [
            result,
            ...previous.filter(
              (item) =>
                item.id !== result.id
            ),
          ];

          localStorage.setItem(
            "prepforge_history",
            JSON.stringify(
              newHistory
            )
          );

          return newHistory;
        }
      );

    } catch (error) {
      console.error(
        "History save error:",
        error
      );

      alert(
        "Quiz completed, but the result could not be saved to the database."
      );
    }
  };

  // =========================================================
  // FINISH QUIZ
  // =========================================================

  const finishQuiz = async () => {
    await saveQuizHistory();

    setQuizFinished(true);
    setSubmitted(false);
  };

  // =========================================================
  // RESTART QUIZ
  // =========================================================

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers({});
    setScore(0);
    setSubmitted(false);
    setQuizFinished(false);
    setShowCelebration(false);
    setTimeLeft(30);
    setActiveSection("practice");
  };

  // =========================================================
  // START CATEGORY QUIZ
  // =========================================================

  const startCategory = (category) => {
    if (category === "All") {
      setQuestions(allQuestions);
    } else {
      const filtered =
        allQuestions.filter(
          (item) =>
            item.category === category
        );

      setQuestions(filtered);
    }

    setSelectedCategory(category);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers({});
    setScore(0);
    setSubmitted(false);
    setQuizFinished(false);
    setTimeLeft(30);

    setActiveSection("practice");
  };

  // =========================================================
  // SIDEBAR NAVIGATION
  // =========================================================

  const navigate = (section) => {
    setActiveSection(section);

    if (section === "profile") {
      fetchProfile();
    }

    if (section === "history") {
      fetchHistory();
    }
  };

  // =========================================================
  // LANDING PAGE
  // =========================================================

  if (showLanding) {
    return (
      <LandingPage
        onStart={handleLandingClick}
      />
    );
  }

  // =========================================================
  // AUTHENTICATION SCREEN
  // =========================================================

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onLogin={() =>
            setShowRegister(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLoginSuccess}
        onRegister={() =>
          setShowRegister(true)
        }
      />
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>

        <h2>
          Loading PrepForge...
        </h2>

        <p>
          Preparing your questions 🚀
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">

          <div className="error-icon">
            ⚠️
          </div>

          <h1>
            PrepForge
          </h1>

          <h2>
            Unable to load questions
          </h2>

          <p>
            {error}
          </p>

          <button
            className="retry-btn"
            onClick={fetchQuestions}
          >
            🔄 Try Again
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalAttempted =
    history.reduce(
      (total, item) =>
        total +
        (item.attempted || 0),
      0
    );

  const totalCorrect =
    history.reduce(
      (total, item) =>
        total +
        (item.correct || 0),
      0
    );

  const totalIncorrect =
    history.reduce(
      (total, item) =>
        total +
        (item.incorrect || 0),
      0
    );

  const totalQuestions =
    history.reduce(
      (total, item) =>
        total +
        (item.total || 0),
      0
    );

  // Overall accuracy is based on questions actually attempted,
  // not the total number of questions in all quizzes.
  // Example: 11 correct out of 12 attempted = 92%.
  const overallAccuracy =
    totalAttempted > 0
      ? Math.round(
          (totalCorrect /
            totalAttempted) *
            100
        )
      : 0;

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "All",
    ...new Set(
      allQuestions.map(
        (item) => item.category
      )
    ),
  ];

  // =========================================================
  // SCORE SCREEN
  // =========================================================

  if (
    quizFinished &&
    activeSection === "practice"
  ) {
    const percentage =
      questions.length > 0
        ? Math.round(
            (score /
              questions.length) *
              100
          )
        : 0;

    let message =
      "Keep Practicing! 💪";

    if (percentage === 100) {
      message =
        "Excellent Work! 🏆";
    } else if (percentage >= 80) {
      message =
        "Great Job! 🌟";
    } else if (percentage >= 60) {
      message =
        "Good Effort! 👍";
    }

    return (
      <div className="app">

        {/* CONFETTI */}

        <div className="confetti c1"></div>
        <div className="confetti c2"></div>
        <div className="confetti c3"></div>
        <div className="confetti c4"></div>
        <div className="confetti c5"></div>
        <div className="confetti c6"></div>
        <div className="confetti c7"></div>
        <div className="confetti c8"></div>
        <div className="confetti c9"></div>
        <div className="confetti c10"></div>
        <div className="confetti c11"></div>
        <div className="confetti c12"></div>

        <header className="app-header">

          <h1>
            PrepForge
          </h1>

          <p>
            Practice Questions
          </p>

        </header>

        <div className="result-card">

          <div className="trophy">
            🏆
          </div>

          <div className="completed-banner">
            🎉 Quiz Completed! 🎉
          </div>

          <div className="participant-name">
            👋 Well done,{" "}
            <strong>
              {participantName}
            </strong>
            !
          </div>

          <div className="score">
            {score}

            <span>
              {" "}
              / {questions.length}
            </span>
          </div>

          <div className="percentage">
            {percentage}%
          </div>

          <div className="result-message">

            <h2>
              {message}
            </h2>

            <p>
              You completed the quiz.
              Keep improving your
              placement skills! 🚀
            </p>

          </div>

          <div className="stats">

            <div className="stat">

              <div className="stat-icon">
                📋
              </div>

              <div className="stat-title">
                Total Questions
              </div>

              <div className="stat-value">
                {questions.length}
              </div>

            </div>

            <div className="stat">

              <div className="stat-icon">
                ✅
              </div>

              <div className="stat-title">
                Correct Answers
              </div>

              <div className="stat-value">
                {score}
              </div>

            </div>

            <div className="stat">

              <div className="stat-icon">
                🎯
              </div>

              <div className="stat-title">
                Accuracy
              </div>

              <div className="stat-value">
                {percentage}%
              </div>

            </div>

          </div>

          <button
            className="restart-btn"
            onClick={restartQuiz}
          >
            🔄 Restart Quiz
          </button>

          <button
            className="restart-btn"
            style={{
              marginTop: "12px",
            }}
            onClick={() =>
              setActiveSection("progress")
            }
          >
            📊 View My Progress
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // SIDEBAR
  // =========================================================

  const Sidebar = () => (
    <aside className="sidebar">

      <div className="logo">
        🚀

        <span>
          PrepForge
        </span>
      </div>

      <div className="sidebar-menu">

        <div
          className={`menu-item ${
            activeSection ===
            "practice"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("practice")
          }
        >
          🏠

          <span>
            Practice
          </span>
        </div>

        <div
          className={`menu-item ${
            activeSection ===
            "categories"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("categories")
          }
        >
          📚

          <span>
            Categories
          </span>
        </div>

        <div
          className={`menu-item ${
            activeSection ===
            "progress"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("progress")
          }
        >
          📊

          <span>
            My Progress
          </span>
        </div>

        <div
          className={`menu-item ${
            activeSection ===
            "leaderboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("leaderboard")
          }
        >
          🏆

          <span>
            Leaderboard
          </span>
        </div>

        <div
          className={`menu-item ${
            activeSection ===
            "history"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("history")
          }
        >
          🕘

          <span>
            History
          </span>
        </div>

        <div
          className={`menu-item ${
            activeSection ===
            "profile"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("profile")
          }
        >
          👤

          <span>
            Profile
          </span>
        </div>

        <div
          className="menu-item"
          onClick={handleLogout}
          style={{
            marginTop: "20px",
          }}
        >
          🚪

          <span>
            Logout
          </span>
        </div>

      </div>

      <div className="streak-card">

        <div className="streak-icon">
          🔥
        </div>

        <h3>
          Keep Streaking!
        </h3>

        <p>
          You're doing great!
        </p>

        <strong>
          {totalAttempted}
        </strong>

        <span>
          Questions Attempted
        </span>

      </div>

    </aside>
  );

  // =========================================================
  // PROFILE PAGE
  // =========================================================

  if (
    activeSection === "profile"
  ) {
    return (
      <div className="app">

        <Sidebar />

        <main className="main-content">

          <div className="dashboard-page">

            <div className="dashboard-heading">

              <h1>
                👤 My Profile
              </h1>

              <p>
                Your PrepForge account
                details
              </p>

            </div>

            {profileLoading ? (

              <div className="dashboard-card">

                <h2>
                  Loading profile...
                </h2>

              </div>

            ) : profileError ? (

              <div className="dashboard-card">

                <h2>
                  ⚠️ Profile Error
                </h2>

                <p>
                  {profileError}
                </p>

                <button
                  className="restart-btn"
                  onClick={fetchProfile}
                >
                  🔄 Try Again
                </button>

              </div>

            ) : (

              <div className="profile-card">

                <div className="profile-avatar">

                  {(
                    profile.name ||
                    participantName ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <h2>
                  {profile.name ||
                    participantName}
                </h2>

                <p className="profile-role">
                  PrepForge Participant
                </p>

                <div className="profile-details">

                  <div className="profile-detail">

                    <span>
                      👤 Name
                    </span>

                    <strong>
                      {profile.name ||
                        participantName}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      📧 Email
                    </span>

                    <strong>
                      {profile.email ||
                        "Not available"}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      🆔 User ID
                    </span>

                    <strong>
                      {profile.user_id ||
                        "Not available"}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      📝 Questions Attempted
                    </span>

                    <strong>
                      {totalAttempted}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      🎯 Accuracy
                    </span>

                    <strong>
                      {overallAccuracy}%
                    </strong>

                  </div>

                </div>

              </div>

            )}

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // CATEGORIES PAGE
  // =========================================================

  if (
    activeSection ===
    "categories"
  ) {
    return (
      <div className="app">

        <Sidebar />

        <main className="main-content">

          <div className="dashboard-page">

            <div className="dashboard-heading">

              <h1>
                📚 Categories
              </h1>

              <p>
                Choose a category and
                start practicing
              </p>

            </div>

            <div className="category-grid">

              {categories.map(
                (category) => {

                  const count =
                    category === "All"
                      ? allQuestions.length
                      : allQuestions.filter(
                          (item) =>
                            item.category ===
                            category
                        ).length;

                  return (
                    <div
                      className="category-card"
                      key={category}
                      onClick={() =>
                        startCategory(
                          category
                        )
                      }
                    >

                      <div className="category-icon">

                        {category ===
                        "Aptitude"
                          ? "🧮"
                          : category ===
                            "Reasoning"
                          ? "🧠"
                          : category ===
                            "Programming"
                          ? "💻"
                          : "📚"}

                      </div>

                      <h2>
                        {category}
                      </h2>

                      <p>
                        {count} question
                        {count !== 1
                          ? "s"
                          : ""}
                      </p>

                      <button>
                        Start Practice →
                      </button>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // PROGRESS PAGE
  // =========================================================

  if (
    activeSection === "progress"
  ) {
    return (
      <div className="app">

        <Sidebar />

        <main className="main-content">

          <div className="dashboard-page">

            <div className="dashboard-heading">

              <h1>
                📊 My Progress
              </h1>

              <p>
                Track your placement
                preparation
              </p>

            </div>

            <div className="progress-dashboard">

              <div className="big-stat-card">

                <div>
                  📝
                </div>

                <span>
                  Total Questions
                </span>

                <strong>
                  {totalQuestions}
                </strong>

              </div>

              <div className="big-stat-card">

                <div>
                  🎯
                </div>

                <span>
                  Correct
                </span>

                <strong>
                  {totalCorrect}
                </strong>

              </div>

              <div className="big-stat-card">

                <div>
                  ❌
                </div>

                <span>
                  Incorrect
                </span>

                <strong>
                  {totalIncorrect}
                </strong>

              </div>

              <div className="big-stat-card">

                <div>
                  📈
                </div>

                <span>
                  Accuracy
                </span>

                <strong>
                  {overallAccuracy}%
                </strong>

              </div>

            </div>

            <div className="dashboard-card">

              <h2>
                📈 Performance Overview
              </h2>

              <div className="progress-large">

                <div
                  className="progress-large-fill"
                  style={{
                    width: `${overallAccuracy}%`,
                  }}
                ></div>

              </div>

              <p>
                Your overall accuracy is{" "}
                <strong>
                  {overallAccuracy}%
                </strong>
              </p>

            </div>

            <div className="dashboard-card">

              <h2>
                🏆 Quiz Attempts
              </h2>

              <p>
                Total quizzes completed:{" "}
                <strong>
                  {history.length}
                </strong>
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // HISTORY PAGE
  // =========================================================

  if (
    activeSection === "history"
  ) {
    return (
      <div className="app">

        <Sidebar />

        <main className="main-content">

          <div className="dashboard-page">

            <div className="dashboard-heading">

              <h1>
                🕘 Quiz History
              </h1>

              <p>
                View your previous quiz
                attempts
              </p>

            </div>

            {history.length === 0 ? (

              <div className="dashboard-card empty-card">

                <div>
                  📝
                </div>

                <h2>
                  No Quiz History Yet
                </h2>

                <p>
                  Complete your first quiz
                  and your result will appear
                  here.
                </p>

                <button
                  className="restart-btn"
                  onClick={() =>
                    navigate("practice")
                  }
                >
                  🚀 Start Practice
                </button>

              </div>

            ) : (

              <div className="history-list">

                {history.map(
                  (item, index) => (

                    <div
                      className="history-card"
                      key={item.id}
                    >

                      <div className="history-number">
                        #{index + 1}
                      </div>

                      <div className="history-main">

                        <h2>
                          {item.category ||
                            "Mixed"}{" "}
                          Practice
                        </h2>

                        <p>
                          {item.date}
                        </p>

                        <span>
                          👤{" "}
                          {item.name}
                        </span>

                      </div>

                      <div className="history-score">

                        <strong>
                          {item.score}/
                          {item.total}
                        </strong>

                        <span>
                          {item.percentage}%
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // LEADERBOARD PAGE
  // =========================================================

  if (
    activeSection ===
    "leaderboard"
  ) {

    const leaderboard = [
      ...history,
    ]
      .sort(
        (a, b) =>
          b.percentage -
          a.percentage
      )
      .slice(0, 10);

    return (
      <div className="app">

        <Sidebar />

        <main className="main-content">

          <div className="dashboard-page">

            <div className="dashboard-heading">

              <h1>
                🏆 Leaderboard
              </h1>

              <p>
                Your best quiz performances
              </p>

            </div>

            {leaderboard.length ===
            0 ? (

              <div className="dashboard-card empty-card">

                <div>
                  🏆
                </div>

                <h2>
                  Leaderboard is Empty
                </h2>

                <p>
                  Complete a quiz to
                  appear here.
                </p>

              </div>

            ) : (

              <div className="leaderboard-list">

                {leaderboard.map(
                  (item, index) => (

                    <div
                      className={`leaderboard-row ${
                        index === 0
                          ? "first-place"
                          : ""
                      }`}
                      key={item.id}
                    >

                      <div className="rank">

                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}

                      </div>

                      <div className="leader-user">

                        <div className="leader-avatar">

                          {item.name
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.category}
                          </span>

                        </div>

                      </div>

                      <div className="leader-score">

                        <strong>
                          {item.percentage}%
                        </strong>

                        <span>
                          {item.score}/
                          {item.total}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // PRACTICE PAGE
  // =========================================================

  if (
    questions.length === 0
  ) {
    return (
      <div className="error-screen">

        <div className="error-card">

          <div className="error-icon">
            📚
          </div>

          <h1>
            PrepForge
          </h1>

          <h2>
            No Questions Available
          </h2>

          <p>
            Please add questions to the
            database.
          </p>

          <button
            className="retry-btn"
            onClick={fetchQuestions}
          >
            🔄 Refresh
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // QUIZ CALCULATIONS
  // =========================================================

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  const answeredCount =
    Object.keys(answers).length;

  const incorrectCount =
    Object.keys(answers).filter(
      (id) => {
        const q =
          questions.find(
            (item) =>
              item.id === Number(id)
          );

        return (
          q &&
          answers[id] !==
            q.correct_answer
        );
      }
    ).length;

  const unansweredCount =
    questions.length -
    answeredCount;

  const options = [
    {
      letter: "A",
      value: question.option_a,
    },
    {
      letter: "B",
      value: question.option_b,
    },
    {
      letter: "C",
      value: question.option_c,
    },
    {
      letter: "D",
      value: question.option_d,
    },
  ];

  // =========================================================
  // PRACTICE UI
  // =========================================================

  return (
    <div className="app">

      <div className="floating-shape shape1"></div>
      <div className="floating-shape shape2"></div>
      <div className="floating-shape shape3"></div>

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <main className="main-content">

        <div className="quiz-header">

          <div>

            <h1>
              Practice Questions ✨
            </h1>

            <p>
              Test your knowledge and
              boost your skills
            </p>

          </div>

          <div className="category-badge">
            📚 {question.category}
          </div>

        </div>

        {/* QUIZ GRID */}

        <div className="quiz-layout">

          {/* QUESTION */}

          <section className="question-section">

            <div className="question-card">

              {/* TOP */}

              <div className="question-top">

                <div className="question-number">

                  Question{" "}

                  <strong>
                    {currentQuestion + 1}
                  </strong>

                  {" "}of{" "}

                  <strong>
                    {questions.length}
                  </strong>

                </div>

                <div
                  className={`timer ${
                    timeLeft <= 10
                      ? "timer-danger"
                      : ""
                  }`}
                >

                  ⏱️ 00:

                  {String(
                    timeLeft
                  ).padStart(2, "0")}

                </div>

              </div>

              {/* PROGRESS */}

              <div className="progress-container">

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>

                </div>

                <span>
                  {Math.round(
                    progress
                  )}
                  %
                </span>

              </div>

              {/* QUESTION */}

              <h2 className="question-text">

                {currentQuestion + 1}.
                {" "}
                {question.question}

              </h2>

              {/* OPTIONS */}

              <div className="options">

                {options.map(
                  (option) => {

                    const selected =
                      selectedAnswer ===
                      option.value;

                    const correct =
                      submitted &&
                      option.value ===
                        question.correct_answer;

                    const wrong =
                      submitted &&
                      selected &&
                      option.value !==
                        question.correct_answer;

                    return (
                      <button
                        key={
                          option.letter
                        }
                        className={`
                          option
                          ${
                            selected
                              ? "selected"
                              : ""
                          }
                          ${
                            correct
                              ? "correct"
                              : ""
                          }
                          ${
                            wrong
                              ? "wrong"
                              : ""
                          }
                        `}
                        onClick={() =>
                          handleAnswer(
                            option.value
                          )
                        }
                        disabled={
                          submitted
                        }
                      >

                        <span className="option-letter">
                          {option.letter}
                        </span>

                        <span className="option-text">
                          {option.value}
                        </span>

                        <span className="option-icon">

                          {correct &&
                            "✓"}

                          {wrong &&
                            "✕"}

                          {!submitted &&
                            selected &&
                            "●"}

                        </span>

                      </button>
                    );
                  }
                )}

              </div>

              {/* FEEDBACK */}

              {submitted && (

                <div
                  className={
                    isCorrect
                      ? "answer-feedback correct-feedback"
                      : "answer-feedback wrong-feedback"
                  }
                >

                  {isCorrect ? (

                    <>
                      🎉 Amazing!

                      <strong>
                        Correct Answer!
                      </strong>
                    </>

                  ) : (

                    <>
                      ❌ Not Quite!

                      <strong>
                        Correct Answer:{" "}
                        {
                          question.correct_answer
                        }
                      </strong>
                    </>

                  )}

                </div>

              )}

              {/* SUBMIT */}

              {!submitted && (

                <button
                  className="submit-btn"
                  onClick={
                    submitAnswer
                  }
                >
                  🚀 Submit Answer
                </button>

              )}

            </div>

            {/* NAVIGATION */}

            <div className="navigation">

              <button
                className="nav-btn"
                onClick={
                  previousQuestion
                }
                disabled={
                  currentQuestion ===
                  0
                }
              >
                ← Previous
              </button>

              {submitted && (

                <button
                  className="nav-btn next-btn"
                  onClick={
                    nextQuestion
                  }
                >

                  {currentQuestion ===
                  questions.length - 1
                    ? "Finish Quiz 🏆"
                    : "Next Question →"}

                </button>

              )}

            </div>

            {/* FEATURES */}

            <div className="features">

              <div className="feature">

                <div className="feature-icon purple">
                  🎯
                </div>

                <div>

                  <h3>
                    Focus
                  </h3>

                  <p>
                    Stay focused and
                    achieve your goals
                  </p>

                </div>

              </div>

              <div className="feature">

                <div className="feature-icon pink">
                  ⚡
                </div>

                <div>

                  <h3>
                    Practice
                  </h3>

                  <p>
                    Practice daily to
                    improve your skills
                  </p>

                </div>

              </div>

              <div className="feature">

                <div className="feature-icon orange">
                  🏆
                </div>

                <div>

                  <h3>
                    Excel
                  </h3>

                  <p>
                    Excel in your
                    placement preparation
                  </p>

                </div>

              </div>

              <div className="feature">

                <div className="feature-icon blue">
                  ⭐
                </div>

                <div>

                  <h3>
                    Succeed
                  </h3>

                  <p>
                    Success is within reach
                  </p>

                </div>

              </div>

            </div>

            <div className="tip-box">

              💡{" "}

              <strong>
                Tip:
              </strong>{" "}

              Read each question
              carefully before
              answering.

            </div>

          </section>

          {/* RIGHT SIDEBAR */}

          <aside className="right-sidebar">

            {/* PROGRESS */}

            <div className="progress-card">

              <h3>
                Your Progress
              </h3>

              <div className="progress-circle">

                <div>

                  <strong>
                    {answeredCount}/
                    {questions.length}
                  </strong>

                  <span>
                    Answered
                  </span>

                </div>

              </div>

              <p>

                {Math.round(
                  (answeredCount /
                    questions.length) *
                    100
                )}
                % Completed

              </p>

            </div>

            {/* QUICK STATS */}

            <div className="quick-stats">

              <h3>
                Quick Stats
              </h3>

              <div className="stat-row">

                <span>
                  🟢 Correct
                </span>

                <strong className="green">
                  {score}
                </strong>

              </div>

              <div className="stat-row">

                <span>
                  🔴 Incorrect
                </span>

                <strong className="red">
                  {incorrectCount}
                </strong>

              </div>

              <div className="stat-row">

                <span>
                  🔵 Unattempted
                </span>

                <strong className="blue-text">
                  {unansweredCount}
                </strong>

              </div>

            </div>

            {/* NAVIGATOR */}

            <div className="navigator">

              <h3>
                Question Navigator
              </h3>

              <div className="question-buttons">

                {questions.map(
                  (item, index) => {

                    const answered =
                      answers[item.id];

                    return (
                      <button
                        key={item.id}
                        className={`
                          question-nav-btn
                          ${
                            index ===
                            currentQuestion
                              ? "current"
                              : ""
                          }
                          ${
                            answered
                              ? "answered"
                              : ""
                          }
                        `}
                        onClick={() =>
                          goToQuestion(
                            index
                          )
                        }
                      >
                        {index + 1}
                      </button>
                    );
                  }
                )}

              </div>

              <div className="legend">

                <span>
                  <i className="dot purple-dot"></i>
                  Answered
                </span>

                <span>
                  <i className="dot gray-dot"></i>
                  Unattempted
                </span>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* CORRECT ANSWER CELEBRATION */}

      {showCelebration && (

        <div className="celebration">

          <div className="celebration-confetti">
            🎉
          </div>

          <div className="celebration-content">

            <div className="celebration-icon">
              ✓
            </div>

            <h2>
              Amazing!
            </h2>

            <h3>
              Correct Answer!
            </h3>

            <p>
              Keep going! You're doing
              great! 🚀
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;