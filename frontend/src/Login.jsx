import { useState } from "react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:8000";

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save JWT token
      localStorage.setItem("token", data.access_token);

      // Save participant information
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_email", data.email);

      // Tell App.jsx login was successful
      onLogin(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-background-circle circle-one"></div>
      <div className="auth-background-circle circle-two"></div>

      <div className="auth-card">

        <div className="auth-logo">
          🚀
        </div>

        <h1>PrepForge</h1>

        <p className="auth-subtitle">
          Welcome Back!
        </p>

        <p className="auth-description">
          Login to continue your placement preparation
        </p>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "🚀 Login"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Don't have an account?
        </p>

        <button
          className="secondary-auth-button"
          onClick={onRegister}
        >
          Create New Account
        </button>

      </div>

    </div>
  );
}

export default Login;