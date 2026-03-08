import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";
import { logoutUser } from "../context/AuthContext";
import { auth } from "../auth/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobile);
  }, [mobile]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobile(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/market", label: "Market" },
    { path: "/bifrost", label: "Bifrost" },
    { path: "/odineye", label: "Odin's Eye" },
    { path: "/wallet", label: "Wallet" },
  ];

  return (
    <>
      <motion.nav 
        className={`aether-nav ${scrolled ? "nav-scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="nav-container">
          {/* BRAND */}
          <Link to="/" className="nav-brand group">
            <div className="nav-brand-rune" />
            <span className="nav-brand-text">OD<span className="text-aurora">I</span>N</span>
          </Link>

          {/* CENTER LINKS */}
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? "active" : ""}`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="nav-indicator"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* RIGHT SIDE */}
          <div className="nav-right">
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            >
              <span className="theme-toggle-icon">
                {theme === "dark" ? "☀️" : "🌙"}
              </span>
            </button>

            {/* Profile / Login */}
            {user ? (
              <div className="nav-dropdown" ref={dropdownRef}>
                <button
                  className="nav-profile-btn glow-border"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  <img
                    src={user.photoURL || "https://res.cloudinary.com/daijhwmiz/image/upload/v1750857697/account1_fwnqv3.png"}
                    alt="Profile"
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="nav-dropdown-menu glass"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="dropdown-header">
                        <p className="dropdown-email">{user.email}</p>
                      </div>
                      <div className="dropdown-items">
                        <Link to="/profile" className="dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Manage Account
                        </Link>
                        <button className="dropdown-item logout" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-rune nav-login-btn">
                <span>Enter Realm</span>
              </Link>
            )}

            {/* Hamburger */}
            <button
              className={`nav-hamburger ${mobile ? "open" : ""}`}
              onClick={() => setMobile(prev => !prev)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {mobile && (
          <motion.div 
            className="mobile-nav-overlay glass"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="mobile-nav-links">
              {navLinks.map((link, i) => (
                <motion.li 
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                >
                  <Link 
                    to={link.path}
                    className={isActive(link.path) ? "active" : ""}  
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li 
                className="mobile-divider"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              />
              {user ? (
                <>
                  <motion.li initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    <Link to="/profile">Manage Account</Link>
                  </motion.li>
                  <motion.li initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <button onClick={handleLogout} className="mobile-logout">Sign Out</button>
                  </motion.li>
                </>
              ) : (
                <motion.li initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <Link to="/login" className="mobile-login">Enter the Realm</Link>
                </motion.li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
