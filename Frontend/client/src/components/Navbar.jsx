import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "@headlessui/react";
import "./Navbar.css";
import { logoutUser } from "../context/AuthContext";
import { auth } from "../auth/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Navbar() {
  const [mobile, setMobile] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobile);
  }, [mobile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <svg style={{ display: "none" }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      <nav className={`glass-nav ${sticky ? "sticky-nav" : ""}`}>
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content">
          <ul className="nav-list">
            <li><Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`} onClick={() => setMobile(false)}>Home</Link></li>
            <li><Link to="/market" className={`nav-item ${isActive("/market") ? "active" : ""}`} onClick={() => setMobile(false)}>Market</Link></li>
            <li><Link to="/bifrost" className={`nav-item ${isActive("/bifrost") ? "active" : ""}`} onClick={() => setMobile(false)}>BiFrost</Link></li>
            <li><Link to="/odineye" className={`nav-item ${isActive("/odineye") ? "active" : ""}`} onClick={() => setMobile(false)}>Odin's Eye</Link></li>
            <li><Link to="/wallet" className={`nav-item ${isActive("/wallet") ? "active" : ""}`} onClick={() => setMobile(false)}>Wallet</Link></li>
          </ul>

          <div className="nav-right">
            {user ? (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="profile-avatar-btn">
                  <img
                    src={user.photoURL || "https://res.cloudinary.com/daijhwmiz/image/upload/v1750857697/account1_fwnqv3.png"} // fallback avatar
                    alt="P"
                    className="rounded-full w-8 h-8 border border-gray-300"
                  />
                </Menu.Button>

                <Menu.Items className="dropdown-menu">
                  <div className="dropdown-header">
                    
                    <div>
                      <p className="dropdown-wallet"><span className="mail">CONNECTED BY EMAIL - </span>{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-options">
                    <Menu.Item>
                      <Link to="/profile" className="dropdown-btn">
                        <i className="fas fa-user-cog"></i> Manage Account
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <button onClick={handleLogout} className="dropdown-btn">
                        <i className="fas fa-sign-out-alt"></i> Sign Out
                      </button>
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            ) : (
              <Link to="/login" className="icon-btn" title="Login">
                <i className="fas fa-user-circle"></i>
              </Link>
            )}

            <div className="mobile-menu-icon" onClick={() => setMobile(!mobile)}>
              <i className="fas fa-bars"></i>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobile ? "mobile-show" : ""}`}>
        <span className="close-mobile" onClick={() => setMobile(false)}>
          <i className="fas fa-times"></i>
        </span>
        <ul className="mobile-links">
          <li><Link to="/" onClick={() => setMobile(false)}>Home</Link></li>
          <li><Link to="/market" onClick={() => setMobile(false)}>Market</Link></li>
          <li><Link to="/bifrost" onClick={() => setMobile(false)}>Bifrost</Link></li>
          <li><Link to="/odineye" onClick={() => setMobile(false)}>Odin's Eye</Link></li>
          <li><Link to="/wallet" onClick={() => setMobile(false)}>Wallet</Link></li>
          {user ? (
            <li><button onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button></li>
          ) : (
            <li><Link to="/login" onClick={() => setMobile(false)}><i className="fas fa-user-circle"></i> Login</Link></li>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;
