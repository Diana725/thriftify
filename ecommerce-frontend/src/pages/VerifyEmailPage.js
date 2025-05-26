import { useState } from "react";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resendVerification = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    // pull the email you saved at registration time
    const email = localStorage.getItem("unverified_email");

    try {
      const res = await fetch(
        "http://localhost:8000/api/email/verification-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend link");

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow-lg text-center"
        style={{ width: "400px" }}
      >
        <h2 className="mb-3">Verify Your Email</h2>
        <p>
          We’ve sent a verification link to your email. Please check your inbox.
        </p>

        {message && <p className="text-success">{message}</p>}
        {error && <p className="text-danger">{error}</p>}

        <button
          className="btn btn-outline-primary mt-3"
          onClick={resendVerification}
          disabled={loading}
        >
          {loading ? "Resending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}
