import { useEffect, useState } from "react";
import "./History.css";

const API_URL = "http://127.0.0.1:8000";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("token");
        setError("Your session has expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to load quiz history"
        );
      }

      setHistory(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("History error:", err);
      setError(err.message || "Failed to load quiz history");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-header">
          <div className="history-icon">🕘</div>

          <div>
            <h1>Quiz History</h1>
            <p>View your previous quiz attempts</p>
          </div>
        </div>

        <div className="empty-history">
          <div>⏳</div>
          <h2>Loading...</h2>
          <p>Loading your quiz history...</p>
        </div>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================

  if (error) {
    return (
      <div className="history-page">
        <div className="history-header">
          <div className="history-icon">🕘</div>

          <div>
            <h1>Quiz History</h1>
            <p>View your previous quiz attempts</p>
          </div>
        </div>

        <div className="empty-history">
          <div>⚠️</div>
          <h2>Unable to load history</h2>
          <p>{error}</p>

          <button
            className="retry-button"
            onClick={fetchHistory}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // MAIN PAGE
  // ================================

  return (
    <div className="history-page">

      {/* HEADER */}
      <div className="history-header">

        <div className="history-icon">
          🕘
        </div>

        <div>
          <h1>Quiz History</h1>
          <p>View your previous quiz attempts</p>
        </div>

      </div>

      {/* NO HISTORY */}
      {history.length === 0 ? (

        <div className="empty-history">

          <div>📖</div>

          <h2>No quiz attempts yet</h2>

          <p>
            Complete a quiz and your results will appear here.
          </p>

        </div>

      ) : (

        <div className="history-list">

          {history.map((item, index) => {

            const total =
              Number(item.total_questions) || 0;

            const correct =
              Number(item.correct_answers) || 0;

            const incorrect =
              Number(item.incorrect_answers) || 0;

            /*
              IMPORTANT:
              Use the score calculated by the backend.

              Your FastAPI backend already calculates:
              score = correct_answers / total_questions * 100
            */

            const score =
              item.score !== undefined &&
              item.score !== null
                ? Number(item.score)
                : total > 0
                  ? Math.round((correct / total) * 100)
                  : 0;

            return (

              <div
                className="history-card"
                key={item.id || index}
              >

                {/* =========================
                    TOP
                ========================= */}

                <div className="history-card-top">

                  <span className="attempt-number">
                    #{index + 1}
                  </span>

                  <span className="history-category">
                    {item.category || "Mixed Practice"}
                  </span>

                </div>


                {/* =========================
                    DATE
                ========================= */}

                <div className="history-date">

                  🕒{" "}

                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleString()
                    : "Date unavailable"}

                </div>


                {/* =========================
                    USER
                ========================= */}

                <div className="history-user">

                  👤 Quiz Attempt

                </div>


                {/* =========================
                    RESULT
                ========================= */}

                <div className="history-result">

                  {/* CORRECT */}

                  <div className="score-box">

                    <div className="score-number">

                      <strong>
                        {correct}
                      </strong>

                      <span className="score-total">
                        /{total}
                      </span>

                    </div>

                    <small>
                      Correct
                    </small>

                  </div>


                  {/* SCORE */}

                  <div className="percentage-box">

                    <strong>
                      {score}%
                    </strong>

                    <small>
                      Score
                    </small>

                  </div>


                  {/* INCORRECT */}

                  <div className="wrong-box">

                    <strong>
                      {incorrect}
                    </strong>

                    <small>
                      Incorrect
                    </small>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default History;