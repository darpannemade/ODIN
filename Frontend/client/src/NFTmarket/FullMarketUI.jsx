import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Marketplace from './Marketplace';
import './FullMarketUI.css';

// Using consistent branding
import metamaskLogo from '../assets/images/walletpage/fox.png';

export default function FullMarketUI() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWallet(accounts[0]);
      const bal = await provider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(bal));
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectWallet = () => { 
    setWallet(null); 
    setBalance(null); 
  };

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdTokenResult();
        setIsAdmin(token.claims?.admin || false);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Frame animation variants
  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="bifrost-layout page-enter">
      <div className="cosmic-bg" />
      
      {/* SIDEBAR */}
      {!isMobile ? (
        <motion.aside 
          className="bifrost-sidebar glass"
          initial="hidden"
          animate="visible"
          variants={sidebarVariants}
        >
          <div className="sidebar-brand text-center">
            <div className="nav-brand-rune mx-auto mb-2" style={{ width: 40, height: 40 }} />
            <h2 className="sidebar-title">Bifrost</h2>
            <p className="sidebar-subtitle text-aurora">Market Gateway</p>
          </div>

          <div className="aether-line mx-auto mb-6" style={{ width: '60%' }} />

          {wallet ? (
            <div className="sidebar-wallet-info mb-8">
              <div className="wallet-pill mx-auto mb-3" style={{ justifyContent: 'center' }}>
                <span className="dot rgb-success" />
                <span className="address" style={{ fontSize: '0.75rem' }}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
              </div>
              
              <div className="wallet-balance-box aether-card text-center py-3 px-2 mb-3">
                <span className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Treasury</span>
                <span className="text-xl font-display font-bold text-primary flex items-center justify-center gap-2">
                  <span className="text-aurora">Ξ</span> 
                  {showBalance ? parseFloat(balance).toFixed(4) : '••••'}
                </span>
                <button 
                  className="btn-text hover-glow text-xs mt-2" 
                  onClick={() => setShowBalance(p => !p)}
                >
                  {showBalance ? 'Hide Balance' : 'Reveal Balance'}
                </button>
              </div>
              
              <button className="btn-rune w-full btn-sm" onClick={disconnectWallet}>
                Sever Connection
              </button>
            </div>
          ) : (
            <div className="sidebar-connect mb-8 text-center">
              <img src={metamaskLogo} alt="MetaMask" className="mx-auto mb-3" style={{ width: 48 }} />
              <button className="btn-aether w-full btn-sm" onClick={connectWallet}>
                Link Treasury
              </button>
            </div>
          )}

          <nav className="sidebar-nav">
            <h3 className="nav-group-title">Portals</h3>
            <Link to="/mint" className="sidebar-link">
              <span className="icon">✨</span> Forge Relic
            </Link>
            <Link to="/marketplace" className="sidebar-link active">
              <span className="icon">🌌</span> Explore Market
            </Link>
            <Link to="/manageNFT" className="sidebar-link">
              <span className="icon">📚</span> My Collection
            </Link>
            <Link to="/profile" className="sidebar-link">
              <span className="icon">👤</span> Runesmith Profile
            </Link>
            
            {isAdmin && (
              <>
                <div className="aether-line my-4 opacity-50" />
                <h3 className="nav-group-title text-violet">Eye of Odin</h3>
                <Link to="/admin" className="sidebar-link admin">
                  <span className="icon">🛡️</span> Realm Admin
                </Link>
              </>
            )}
          </nav>
        </motion.aside>
      ) : (
        <div className="bifrost-mobile-wrapper">
          <div className="bifrost-mobile-msg aether-card text-center">
            <div className="nav-brand-rune mx-auto mb-4" />
            <h3>Bifrost is Desktop Only</h3>
            <p className="text-muted mt-2">The cosmic market requires a wider viewport to render safely.</p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`bifrost-main ${isMobile ? 'hidden' : ''}`}>
        <Marketplace />
      </main>
    </div>
  );
}
