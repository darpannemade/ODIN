// FullMarketUI.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Marketplace from './Marketplace';
import './FullMarketUI.css';
import metamaskLogo from '../assets/metamask.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles,
  faCompass,
  faLayerGroup,
  faUser,
  faShieldHalved,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

function FullMarketUI() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const bal = await provider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(bal));
    } else {
      alert("Please install MetaMask");
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setBalance(null);
  };

  const toggleBalance = () => setShowBalance(!showBalance);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdTokenResult();
        setIsAdmin(token.claims?.admin || false);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="mainui-container">
      {!isMobile ? (
        <aside className="mainui-sidebar">
          <h1 className="mainui-title">BIFROST</h1>
          <p className="mainui-subtitle">Summon Wallet Through</p>
          <img src={metamaskLogo} alt="MetaMask" className="mainui-metamask-logo" />
          <p className="mainui-subtitle2">Metamask</p>
          <hr className="mainui-separator" />

          {wallet ? (
            <>
              <div className="mainui-wallet-card">
                <div className="mainui-wallet-card-header">
                  <span className="mainui-wallet-label">Wallet Address:</span>
                  <p className="mainui-wallet-value">
                    {wallet.slice(0, 6)}...{wallet.slice(-4)}
                  </p>
                </div>
                <div className="mainui-wallet-card-footer">
                  <div className="mainui-wallet-balance-wrapper">
                    <span className="mainui-wallet-balance-label">Total Balance</span>
                    <span className="mainui-wallet-balance-value">
                      {showBalance ? `${balance?.slice(0, 6)} ETH` : '••••'}
                    </span>
                  </div>
                  <button className="mainui-toggle-btn" onClick={toggleBalance}>
                    <FontAwesomeIcon icon={showBalance ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="mainui-wallet-actions">
                <button className="mainui-wallet-btn" onClick={() => alert("Add funds - external action")}>
                  Add Funds
                </button>
                <button className="mainui-wallet-btn mainui-disconnect" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <button className="mainui-connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          <hr className="mainui-separator" />

          <nav className="mainui-links">
            <Link to="/mint" className="mainui-link">
              <FontAwesomeIcon icon={faWandMagicSparkles} className="mainui-link-icon" />
              Mint NFT's
            </Link>
            <Link to="/marketplace" className="mainui-link">
              <FontAwesomeIcon icon={faCompass} className="mainui-link-icon" />
              Explore More
            </Link>
            <Link to="/manageNFT" className="mainui-link">
              <FontAwesomeIcon icon={faLayerGroup} className="mainui-link-icon" />
              Manage Your NFT's
            </Link>
            <Link to="/profile" className="mainui-link">
              <FontAwesomeIcon icon={faUser} className="mainui-link-icon" />
              Profile
            </Link>
            {isAdmin && (
              <Link to="/admin" className="mainui-link mainui-admin-link">
                <FontAwesomeIcon icon={faShieldHalved} className="mainui-link-icon" />
                Admin Panel
              </Link>
            )}
          </nav>
        </aside>
      ) : (
        <div className="mainui-mobile-message">
          📱 This experience is optimized for desktop. To explore more, please use a larger screen.
        </div>
      )}

      <main className="mainui-marketplace">
        <Marketplace />
      </main>
    </div>
  );
}

export default FullMarketUI;
