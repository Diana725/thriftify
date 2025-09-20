import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleAuthButton from "../utils/GoogleAuthButton";
import "./Auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingin, setIsLoggingin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoggingin(true);

    try {
      const res = await fetch("https://www.thriftify.website/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("login"));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoggingin(false);
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center vh-100">
      <div className="auth-card card p-4 shadow-lg">
        <h2 className="auth-title text-center mb-3">Login</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        {/* Google first */}
        <div className="mb-3">
          <GoogleAuthButton />
        </div>

        {/* OR divider */}
        <div className="or-divider d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted">OR</span>
          <hr className="flex-grow-1" />
        </div>

        {/* Sign-in form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control auth-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group mb-3 auth-input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="input-group-text reveal-toggle"
              onClick={() => setShowPassword((v) => !v)}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-auth-primary w-100"
            disabled={isLoggingin}
          >
            {isLoggingin ? "Logging In…" : "Login"}
          </button>

          <div className="text-center mt-2">
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <div className="text-center mt-3">
            <span className="text-muted me-1">Don’t have an account?</span>
            <Link to="/register" className="auth-link-strong">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
