import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import "./Auth.css"; // Shared auth styles

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Accessing the Realm...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back to ODIN", { id: toastId });
      navigate("/");
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const toastId = toast.loading("Connecting with Google...");
    try {
      await signInWithPopup(auth, provider);
      toast.success("Welcome back to ODIN", { id: toastId });
      navigate("/");
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper page-enter">
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />
      <div className="cosmic-bg" />
      
      <div className="container">
        <motion.div 
          className="auth-card aether-card glow-border"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header text-center">
            <div className="nav-brand-rune mx-auto" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
            <h1 className="auth-title">Enter The <span className="text-aurora">Aether</span></h1>
            <p className="auth-subtitle text-muted">Sign in to access your cosmic treasury</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="odin@valhalla.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group mt-4">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-aether w-full mt-8" disabled={loading}>
              {loading ? "Verifying Runes..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button 
            type="button" 
            className="btn-rune w-full btn-google" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Google Sign-in
          </button>

          <p className="auth-footer-text">
            Not forged yet? <Link to="/register" className="auth-link text-aurora">Register Here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
