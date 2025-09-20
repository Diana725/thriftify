import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleAuthButton from "../utils/GoogleAuthButton";
import "./Auth.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsRegistering(true);

    try {
      const res = await fetch("https://www.thriftify.website/api/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || data.email?.[0] || "Registration failed"
        );

      // Optional: store email locally for later resend logic
      localStorage.setItem("unverified_email", email);

      // Show verification message
      setSuccessMessage(
        "Registration successful! Please check your email to verify your account."
      );

      // Delay before redirect (2–3 seconds)
      setTimeout(() => {
        navigate("/verify-email");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center vh-80">
      <div className="auth-card card p-4 shadow-lg">
        <h2 className="auth-title text-center mb-3">Create Account</h2>

        {error && <p className="text-danger text-center">{error}</p>}
        {successMessage && (
          <p className="text-success text-center">{successMessage}</p>
        )}

        {/* Google first */}
        <div className="mb-3">
          <GoogleAuthButton />{" "}
          {/* add className="google-btn" inside if needed */}
        </div>

        {/* OR divider */}
        <div className="or-divider d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted">OR</span>
          <hr className="flex-grow-1" />
        </div>

        {/* Registration form */}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control auth-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group auth-input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control auth-input"
                placeholder="Enter password"
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
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="input-group auth-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control auth-input"
                placeholder="Confirm password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
              <span
                className="input-group-text reveal-toggle"
                onClick={() => setShowConfirmPassword((v) => !v)}
                role="button"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-auth-primary w-100"
            disabled={isRegistering}
          >
            {isRegistering ? "Registering…" : "Register"}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted me-1">Already have an account?</span>
            <Link to="/login" className="auth-link-strong">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
