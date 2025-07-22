import React, { useState, useEffect } from "react";
import "./Auth.css";
import odinImage from "../assets/images/odin.jpg";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Redirect if already logged in

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // ✅ Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error.message);
      setErrorMsg("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-toggle">
          <button className="auth-tab active">Sign In</button>
          <Link to="/register" className="auth-tab">Sign Up</Link>
        </div>

        <h2 className="auth-title">Summon the Bifröst</h2>
        <p className="auth-subtitle">Login to your account</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && (
            <p style={{ color: "#f87171", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              {errorMsg}
            </p>
          )}

          <button type="submit" className="auth-btn">
            Log In
          </button>
        </form>
      </div>

      <img src={odinImage} alt="Odin" className="odin-image-below" />
    </div>
  );
}

export default Login;
