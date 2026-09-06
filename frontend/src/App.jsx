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

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
    }
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
    useState("jdPractice");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // =========================================================
  // JD BASED PRACTICE
  // =========================================================

  const [jobDescription, setJobDescription] =
    useState("");

  const [detectedSkills, setDetectedSkills] =
    useState([]);

  const [jdLoading, setJdLoading] =
    useState(false);

  const [jdError, setJdError] =
    useState("");

  // =========================================================
  // QUESTIONS
  // =========================================================

  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [answers, setAnswers] =
    useState({});

  const [score, setScore] =
    useState(0);

  const [submitted, setSubmitted] =
    useState(false);

  const [quizFinished, setQuizFinished] =
    useState(false);

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

  const [timeLeft, setTimeLeft] =
    useState(30);

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
    setActiveSection("jdPractice");
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
  // JD BASED PRACTICE
  // =========================================================

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      setJdError(
        "Please enter a job description first."
      );
      return;
    }

    try {
      setJdLoading(true);
      setJdError("");

      const response = await fetch(
        `${API_URL}/api/jd-practice`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            job_description:
              jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to analyze job description"
        );
      }

      setDetectedSkills(
        data.skills || []
      );

      if (
        !data.questions ||
        data.questions.length === 0
      ) {
        setQuestions([]);

        setJdError(
          "No questions are available for the detected skills."
        );

        return;
      }

      setQuestions(data.questions);

      setAllQuestions(
        data.questions
      );

      setSelectedCategory(
        data.skills &&
        data.skills.length > 0
          ? data.skills.join(", ")
          : "JD Practice"
      );

    } catch (err) {
      console.error(
        "JD practice error:",
        err
      );

      setDetectedSkills([]);

      setJdError(
        err.message ||
          "Unable to analyze the job description"
      );

    } finally {
      setJdLoading(false);
    }
  };

  // =========================================================
  // START JD QUIZ
  // =========================================================

  const startJDQuiz = () => {
    if (questions.length === 0) {
      setJdError(
        "Analyze a job description before starting practice."
      );
      return;
    }

    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers({});
    setScore(0);
    setSubmitted(false);
    setQuizFinished(false);
    setTimeLeft(30);

    setActiveSection("jdQuiz");
  };

  // =========================================================
  // BACK TO JD PRACTICE
  // =========================================================

  const backToJDPractice = () => {
    setQuizFinished(false);
    setSubmitted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers({});
    setScore(0);
    setTimeLeft(30);

    setActiveSection("jdPractice");
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

      const data =
        await response.json();

      const formattedHistory =
        data.map((item) => ({
          id: item.id,

          name:
            participantName ||
            profile.name ||
            "Participant",

          score:
            item.correct_answers,

          total:
            item.total_questions,

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

          correct:
            item.correct_answers,

          incorrect:
            item.incorrect_answers,

          category:
            item.category ||
            "Mixed",

          date:
            new Date(
              item.created_at
            ).toLocaleString(),
        }));

      setHistory(
        formattedHistory
      );

      localStorage.setItem(
        "prepforge_history",
        JSON.stringify(
          formattedHistory
        )
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
    if (isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      activeSection !== "jdQuiz" ||
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
      [question.id]:
        selectedAnswer,
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
                item.id ===
                Number(id)
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
      selectedCategory &&
      selectedCategory !== "All"
        ? selectedCategory
        : "JD Practice";

    // --------------------------------------------
    // GET LOGIN TOKEN
    // --------------------------------------------

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      alert(
        "Please login before completing a quiz."
      );
      return;
    }

    // --------------------------------------------
    // SAVE TO FASTAPI + POSTGRESQL
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

            score:
              percentage,
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
        id:
          savedHistory.id,

        name:
          participantName ||
          profile.name ||
          "Participant",

        score:
          correctAnswers,

        total:
          questions.length,

        percentage:
          percentage,

        attempted:
          attempted,

        correct:
          correctAnswers,

        incorrect:
          incorrect,

        category:
          category,

        date:
          new Date(
            savedHistory.created_at
          ).toLocaleString(),
      };

      setHistory(
        (previous) => {
          const newHistory = [
            result,

            ...previous.filter(
              (item) =>
                item.id !==
                result.id
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

    setActiveSection("jdPractice");
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

  const overallAccuracy =
    totalAttempted > 0
      ? Math.round(
          (totalCorrect /
            totalAttempted) *
            100
        )
      : 0;
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

        {/* JD PRACTICE */}

        <div
          className={`menu-item ${
            activeSection ===
            "jdPractice"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("jdPractice")
          }
        >
          🎯

          <span>
            JD Practice
          </span>
        </div>


        {/* PROGRESS */}

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


        {/* LEADERBOARD */}

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


        {/* HISTORY */}

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


        {/* PROFILE */}

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


        {/* LOGOUT */}

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


      {/* STREAK */}

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
  // JD PRACTICE PAGE
  // =========================================================

  if (
    activeSection ===
    "jdPractice"
  ) {

    return (
      <div className="app">

        <Sidebar />


        <main className="main-content">

          <div className="dashboard-page">


            {/* HEADING */}

            <div className="dashboard-heading">

              <h1>
                🎯 JD-Based Practice
              </h1>

              <p>
                Paste a job description and
                practice questions based on
                the required skills.
              </p>

            </div>


            {/* JOB DESCRIPTION */}

            <div className="dashboard-card">

              <h2>
                📄 Job Description
              </h2>

              <p>
                Enter the job description
                provided by the company.
              </p>


              <textarea
                value={jobDescription}
                onChange={(event) => {

                  setJobDescription(
                    event.target.value
                  );

                  setJdError("");
                }}

                placeholder="Paste the job description here..."

                rows={12}

                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding: "16px",
                  marginTop: "15px",
                  borderRadius: "12px",
                  border:
                    "1px solid #d9d9e3",
                  fontSize: "16px",
                  resize: "vertical",
                  fontFamily:
                    "inherit",
                  lineHeight: "1.6",
                }}
              />


              {/* ERROR */}

              {jdError && (

                <p
                  style={{
                    color: "#d32f2f",
                    marginTop: "12px",
                    fontWeight: "600",
                  }}
                >
                  ⚠️ {jdError}
                </p>

              )}


              {/* ANALYZE */}

              <button
                className="restart-btn"

                onClick={
                  analyzeJobDescription
                }

                disabled={jdLoading}

                style={{
                  marginTop: "16px",
                  opacity:
                    jdLoading
                      ? 0.7
                      : 1,
                }}
              >

                {jdLoading
                  ? "🔍 Analyzing..."
                  : "🔍 Analyze Job Description"}

              </button>

            </div>


            {/* DETECTED SKILLS */}

            {detectedSkills.length > 0 && (

              <div className="dashboard-card">

                <h2>
                  🧠 Detected Skills
                </h2>

                <p>
                  Skills identified from
                  the job description:
                </p>


                <div
                  style={{
                    display: "flex",
                    flexWrap:
                      "wrap",
                    gap: "10px",
                    marginTop:
                      "15px",
                  }}
                >

                  {detectedSkills.map(
                    (skill) => (

                      <span
                        key={skill}

                        style={{
                          padding:
                            "8px 14px",

                          borderRadius:
                            "20px",

                          background:
                            "#f0ebff",

                          fontWeight:
                            "600",
                        }}
                      >
                        {skill}
                      </span>

                    )
                  )}

                </div>


                <p
                  style={{
                    marginTop:
                      "18px",
                  }}
                >
                  🎯{" "}
                  <strong>
                    {questions.length}
                  </strong>{" "}
                  relevant questions
                  found.
                </p>


                <button
                  className="restart-btn"

                  onClick={
                    startJDQuiz
                  }

                  style={{
                    marginTop:
                      "10px",
                  }}
                >
                  🚀 Start JD Practice
                </button>

              </div>

            )}


            {/* HOW IT WORKS */}

            <div className="dashboard-card">

              <h2>
                💡 How JD Practice Works
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  marginTop: "18px",
                }}
              >

                <div>
                  <strong>
                    1️⃣ Paste the JD
                  </strong>

                  <p>
                    Copy the job description
                    from the company and
                    paste it above.
                  </p>
                </div>


                <div>
                  <strong>
                    2️⃣ Analyze Skills
                  </strong>

                  <p>
                    PrepForge identifies the
                    technical skills mentioned
                    in the JD.
                  </p>
                </div>


                <div>
                  <strong>
                    3️⃣ Practice
                  </strong>

                  <p>
                    Get random questions
                    related to the detected
                    skills.
                  </p>
                </div>


                <div>
                  <strong>
                    4️⃣ Track Your Score
                  </strong>

                  <p>
                    Complete the quiz and
                    your result is saved in
                    your history.
                  </p>
                </div>

              </div>

            </div>


          </div>

        </main>

      </div>
    );
  }


  // =========================================================
  // PROFILE PAGE
  // =========================================================

  if (
    activeSection ===
    "profile"
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
                  onClick={
                    fetchProfile
                  }
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
  // PROGRESS PAGE
  // =========================================================

  if (
    activeSection ===
    "progress"
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
                    width:
                      `${overallAccuracy}%`,
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
    activeSection ===
    "history"
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
                  Complete your first
                  JD-based quiz and
                  your result will
                  appear here.
                </p>


                <button
                  className="restart-btn"

                  onClick={() =>
                    navigate(
                      "jdPractice"
                    )
                  }
                >
                  🚀 Start JD Practice
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
                            "JD Practice"}{" "}
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
                  Complete a JD-based
                  quiz to appear here.
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
        {/* ==================================================
          JD QUIZ
      ================================================== */}
if (activeSection === "jdQuiz") {
  return (
        <>
          {questions.length === 0 ? (
            <div className="empty-state">
              <h2>No questions available</h2>
              <p>
                No questions were found for the selected JD skills.
              </p>

              <button
                className="primary-btn"
                onClick={backToJDPractice}
              >
                Back to JD Practice
              </button>
            </div>
          ) : quizFinished ? (
            /* ==================================================
               JD QUIZ SCORE SCREEN
            ================================================== */

            <div className="quiz-result-page">

              <div className="result-card">

                <div className="result-icon">
                  🎉
                </div>

                <h1>Practice Completed!</h1>

                <p className="result-message">
                  Great job! Here is your JD Practice result.
                </p>

                <div className="score-circle">
                  <span>{score}</span>
                  <small>/ {questions.length}</small>
                </div>

                <h2>
                  {Math.round(
                    (score / questions.length) * 100
                  )}
                  %
                </h2>

                <p className="score-label">
                  Overall Score
                </p>

                <div className="result-stats">

                  <div className="result-stat">
                    <span className="stat-number">
                      {score}
                    </span>

                    <span className="stat-label">
                      Correct
                    </span>
                  </div>

                  <div className="result-stat">
                    <span className="stat-number">
                      {questions.length - score}
                    </span>

                    <span className="stat-label">
                      Incorrect
                    </span>
                  </div>

                  <div className="result-stat">
                    <span className="stat-number">
                      {questions.length}
                    </span>

                    <span className="stat-label">
                      Total
                    </span>
                  </div>

                </div>

                <div className="result-actions">

                  <button
                    className="primary-btn"
                    onClick={restartQuiz}
                  >
                    Practice Again
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={backToJDPractice}
                  >
                    Back to JD Practice
                  </button>

                </div>

              </div>

            </div>

          ) : (
            /* ==================================================
               ACTIVE JD QUIZ
            ================================================== */

            <div className="quiz-page">

              {/* QUIZ HEADER */}

              <div className="quiz-header">

                <div>
                  <h1>JD Based Practice</h1>

                  <p>
                    Answer questions based on your
                    job description skills.
                  </p>
                </div>

                <div className="quiz-timer">
                  ⏱️{" "}
                  {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :
                  {(timeLeft % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>

              </div>


              {/* QUIZ CONTENT */}

              <div className="quiz-layout">

                {/* LEFT SIDE */}

                <div className="quiz-main">

                  <div className="question-card">

                    {/* QUESTION NUMBER */}

                    <div className="question-top">

                      <span className="question-number">
                        Question {currentQuestion + 1} of{" "}
                        {questions.length}
                      </span>

                      <span className="question-category">
                        {questions[currentQuestion]?.category}
                      </span>

                    </div>


                    {/* QUESTION */}

                    <h2 className="question-text">
                      {questions[currentQuestion]?.question}
                    </h2>


                    {/* OPTIONS */}

                    <div className="options-container">

                      {[
                        {
                          key: "A",
                          text: questions[currentQuestion]
                            ?.option_a
                        },
                        {
                          key: "B",
                          text: questions[currentQuestion]
                            ?.option_b
                        },
                        {
                          key: "C",
                          text: questions[currentQuestion]
                            ?.option_c
                        },
                        {
                          key: "D",
                          text: questions[currentQuestion]
                            ?.option_d
                        }
                      ].map((option) => {

                        const isSelected =
                          selectedAnswer === option.key;

                      

                        const isCorrect =
                          submitted &&
                          option.key ===
                            questions[currentQuestion]
                              ?.correct_answer;

                        const isWrong =
                          submitted &&
                          isSelected &&
                          option.key !==
                            questions[currentQuestion]
                              ?.correct_answer;

                        return (
                          <button
                            key={option.key}
                            className={`option ${
                              isSelected
                                ? "selected"
                                : ""
                            } ${
                              isCorrect
                                ? "correct"
                                : ""
                            } ${
                              isWrong
                                ? "incorrect"
                                : ""
                            }`}
                            onClick={() =>
                              !submitted &&
                              handleAnswer(option.key)
                            }
                            disabled={submitted}
                          >

                            <span className="option-letter">
                              {option.key}
                            </span>

                            <span className="option-text">
                              {option.text}
                            </span>

                          </button>
                        );
                      })}

                    </div>


                    {/* ANSWER FEEDBACK */}

                    {submitted && (
                      <div
                        className={`answer-feedback ${
                          selectedAnswer ===
                          questions[currentQuestion]
                            ?.correct_answer
                            ? "correct-feedback"
                            : "incorrect-feedback"
                        }`}
                      >

                        {selectedAnswer ===
                        questions[currentQuestion]
                          ?.correct_answer ? (
                          <>
                            <strong>
                              ✅ Correct!
                            </strong>

                            <p>
                              Excellent answer.
                            </p>
                          </>
                        ) : (
                          <>
                            <strong>
                              ❌ Incorrect
                            </strong>

                            <p>
                              Correct answer:{" "}
                              <b>
                                {
                                  questions[currentQuestion]
                                    ?.correct_answer
                                }
                              </b>
                            </p>
                          </>
                        )}

                      </div>
                    )}


                    {/* QUIZ CONTROLS */}

                    <div className="quiz-controls">

                      <button
                        className="secondary-btn"
                        onClick={previousQuestion}
                        disabled={
                          currentQuestion === 0
                        }
                      >
                        ← Previous
                      </button>


                      {!submitted ? (
                        <button
                          className="primary-btn"
                          onClick={submitAnswer}
                          disabled={
                            !selectedAnswer
                          }
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          className="primary-btn"
                          onClick={nextQuestion}
                        >
                          {currentQuestion ===
                          questions.length - 1
                            ? "Finish Quiz"
                            : "Next Question →"}
                        </button>
                      )}

                    </div>

                  </div>

                </div>


                {/* RIGHT SIDE */}

                <div className="quiz-sidebar">

                  <div className="quiz-progress-card">

                    <h3>
                      Quiz Progress
                    </h3>

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            ((currentQuestion + 1) /
                              questions.length) *
                            100
                          }%`
                        }}
                      />

                    </div>

                    <p>
                      {currentQuestion + 1} /{" "}
                      {questions.length} Questions
                    </p>

                  </div>


                  {/* QUESTION NAVIGATION */}

                  <div className="question-navigation">

                    <h3>
                      Questions
                    </h3>

                    <div className="question-grid">

                      {questions.map(
                        (item, index) => {

                         const answered =
  answers[questions[index]?.id] !== undefined;

                          return (
                            <button
                              key={index}
                              className={`question-number-btn ${
                                index ===
                                currentQuestion
                                  ? "active"
                                  : ""
                              } ${
                                answered
                                  ? "answered"
                                  : ""
                              }`}
                              onClick={() =>
                                goToQuestion(index)
                              }
                            >
                              {index + 1}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>


                  {/* QUIZ INFORMATION */}

                  <div className="quiz-info-card">

                    <h3>
                      💡 Tips
                    </h3>

                    <ul>

                      <li>
                        Read every question
                        carefully.
                      </li>

                      <li>
                        Eliminate clearly wrong
                        options.
                      </li>

                      <li>
                        Keep an eye on the timer.
                      </li>

                      <li>
                        Review your answers before
                        finishing.
                      </li>

                    </ul>

                  </div>

                </div>

              </div>

            </div>
          )}
        </>
  );
}
}

export default App;