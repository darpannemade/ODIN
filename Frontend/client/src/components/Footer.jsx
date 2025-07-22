import { Link } from "react-router-dom";
import './Footer.css';

function Footer() {
  return (
    <footer className="custom-footer">
      <div className="footer-top-shape" />

      <div className="footer-content">
        <h2 className="footer-title">DIVE INTO WEB3</h2>
        <p className="footer-subtitle">
          Discover Crypto, Charts & Statistics, Odin's EYE, and more inside ODIN.
        </p>

        <Link to="/choose" className="explore-btn">
          EXPLORE WEB3
        </Link>

        <div className="footer-social-icons">
          <a href="#" title="Twitter" className="footer-icon">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" title="Discord" className="footer-icon">
            <i className="fab fa-discord"></i>
          </a>
          <a href="#" title="Facebook" className="footer-icon">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" title="YouTube" className="footer-icon">
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
