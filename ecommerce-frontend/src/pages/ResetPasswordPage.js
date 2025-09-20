import React, { useState, useEffect } from "react";
import {
  useSearchParams,
  useNavigate,
  Link,
  useParams,
} from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../pages/Auth.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const { token: tokenFromPath } = useParams();
  const navigate = useNavigate();

  const token = tokenFromPath || searchParams.get("token");
  const emailQuery = searchParams.get("email");

  const [email, setEmail] = useState(emailQuery || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !emailQuery) {
      setError("Invalid or missing password reset link.");
    }
  }, [token, emailQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "https://www.thriftify.website/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation: passwordConfirm,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setMessage(data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center vh-100">
      <div className="auth-card card shadow-lg p-4" style={{ width: 400 }}>
        <h2 className="auth-title text-center mb-3">Reset Password</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="resetEmail" className="form-label">
                Email address
              </label>
              <input
                id="resetEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!token || isSubmitting}
              />
            </div>

            {/* New password */}
            <div className="mb-3 position-relative">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Confirm password */}
            <div className="mb-3 position-relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPasswordConfirm ? "text" : "password"}
                className="form-control"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 auth-submit"
              disabled={!token || isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-switch text-center mt-3">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
