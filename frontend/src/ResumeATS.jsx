import { useState } from "react";
import "./ResumeATS.css";

const API_URL = "http://127.0.0.1:8000";

function ResumeATS() {
  const [file, setFile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeResume = async () => {
    if (!file) {
      setError("Please select your resume first.");
      return;
    }

    setError("");
    setLoading(true);
    setScore(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(
        `${API_URL}/api/resume/ats`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze resume"
        );
      }

      setScore(data.ats_score);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ats-page">
      <div className="ats-card">

        <div className="ats-icon">
          📄
        </div>

        <h1>Resume ATS Score</h1>

        <p className="ats-subtitle">
          Check how ATS-friendly your resume is
        </p>

        <div className="ats-upload">

          <div className="upload-icon">
            📤
          </div>

          <h3>
            Upload Your Resume
          </h3>

          <p>
            PDF or DOCX • Maximum 5 MB
          </p>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setScore(null);
              setError("");
            }}
          />

          {file && (
            <div className="selected-file">
              📄 {file.name}
            </div>
          )}

        </div>

        {error && (
          <div className="ats-error">
            ⚠️ {error}
          </div>
        )}

        <button
          className="ats-button"
          onClick={analyzeResume}
          disabled={loading}
        >
          {loading
            ? "Analyzing Resume..."
            : "🔍 Check ATS Score"}
        </button>

        {score !== null && (
          <div className="ats-result">

            <p className="score-title">
              Your ATS Score
            </p>

            <div className="ats-score-circle">
              <span>{score}</span>
              <small>/ 100</small>
            </div>

            <h2>
              {score >= 80
                ? "Excellent Resume! 🎉"
                : score >= 60
                ? "Good Resume 👍"
                : score >= 40
                ? "Needs Improvement"
                : "Needs More Work"}
            </h2>

          </div>
        )}

      </div>
    </div>
  );
}

export default ResumeATS;