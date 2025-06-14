import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
      const res = await fetch("https://www.thriftify.website:8000/api/login", {
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
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-3">Login</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoggingin} // disable while loading
          >
            {isLoggingin ? "Logging In…" : "Login"}
          </button>
          <div className="text-center mt-2">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          {/* <div className="text-center mt-3">
            <button className="btn btn-outline-danger w-100">
              <i className="bi bi-google"></i> Login with Google
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}
