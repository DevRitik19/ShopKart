import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await api.post("/customers/login", {
        email,
        password,
      });

      navigate("/home");
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Invalid Credentials");
      } else {
        setError(
          error.response?.data?.message ||
            "Login failed. Please try again."
        );
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>ShopKart</h1>

        <p className="subtitle">
          Customer Authentication
        </p>

        <h2>Login</h2>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p className="switch-text">
          Don't have an account?{" "}
          <Link to="/register">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;