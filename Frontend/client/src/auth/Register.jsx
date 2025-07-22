import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // 🔁 Ensure correct path
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import odinImage from "../assets/images/odin.jpg";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Optional: redirect if already logged in

  useEffect(() => {
    if (user) {
      navigate("/"); // ✅ Already logged in
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // ✅ Redirect after success
    } catch (error) {
      console.error("Registration failed:", error.message);
      setErrorMsg("Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleRegister}>
        <div className="auth-toggle">
          <button type="button" className="active-tab">Sign Up</button>
          <Link to="/login" className="inactive-tab">Sign In</Link>
        </div>

        <h2 className="auth-heading">Begin Your Ascent</h2>

        <input
          type="text"
          placeholder="First name"
          className="auth-input"
          required
        />
        <input
          type="text"
          placeholder="Last name"
          className="auth-input"
        />
        <input
          type="email"
          placeholder="Enter your email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Create password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMsg && (
          <p style={{ color: "#f87171", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            {errorMsg}
          </p>
        )}

        <button type="submit" className="auth-submit">Create</button>

        <p className="auth-footer">
          By creating an account, you agree to our{" "}
          <a href="#">Terms & Service</a>
        </p>
      </form>

      <img src={odinImage} alt="Odin" className="odin-image-below" />
    </div>
  );
}

export default Register;
