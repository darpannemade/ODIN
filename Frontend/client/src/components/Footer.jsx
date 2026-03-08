import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import './Footer.css';

function Footer() {
  return (
    <footer className="aether-footer">
      <div className="footer-top-glow" />

      <div className="container footer-container">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <div className="nav-brand-rune small" />
              <span className="footer-brand-text">OD<span className="text-aurora">I</span>N</span>
            </Link>
            <p className="footer-desc">
              The premier AI-powered NFT Marketplace on the Sepolia network. Forge your digital relics in the cosmic fires of the Aether.
            </p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Twitter" className="footer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="Discord" className="footer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6h0a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1.5l-2.5 3v-3H9a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h9z"/><path d="M10 12v.01"/><path d="M14 12v.01"/></svg>
              </a>
              <a href="#" aria-label="Github" className="footer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Marketplace</h4>
            <ul className="footer-links">
              <li><Link to="/marketplace">Explore NFTs</Link></li>
              <li><Link to="/market">Live Market Data</Link></li>
              <li><Link to="/mint">Forge Relic</Link></li>
              <li><Link to="/wallet">Wallet Transfer</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Account</h4>
            <ul className="footer-links">
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/manageNFT">My Collection</Link></li>
              <li><Link to="/odineye">Odin's Eye AI</Link></li>
            </ul>
          </div>

          {/* CTA Column */}
          <div className="footer-cta-col">
            <h4 className="footer-col-title">Ready to Forge?</h4>
            <p className="footer-cta-desc">Join the Valhalla tier and discover the rarest digital runes.</p>
            <Link to="/choose" className="btn-aether footer-btn">
              <span>EXPLORE WEB3</span>
            </Link>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} ODIN Marketplace. Embark on the Bifrost.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Terms of Service</a>
            <span className="sep"></span>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
