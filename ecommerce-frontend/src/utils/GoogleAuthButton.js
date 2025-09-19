import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const { setShowAuth } = useContext(AuthContext); // Optional: to close modal after login

  const handleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(
        "https://www.thriftify.website/api/auth/google/token-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Google login failed");
      }

      const data = await res.json();

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Fire login event to update AuthContext globally
      window.dispatchEvent(new Event("login"));

      // Optional: Close login modal if used
      setShowAuth(false);

      // Redirect to homepage or dashboard
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleLogin}
      onError={() => console.log("Login Failed")}
    />
  );
};

export default GoogleAuthButton;
