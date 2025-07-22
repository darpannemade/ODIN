import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import ethLogo from "../assets/images/hero/ethereum.png";
import foxLogo from "../assets/images/walletpage/fox.png";
import "./WalletPage.css";



let web3Modal;

export default function WalletPage() {
  
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [signer, setSigner] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(true);

  if (!web3Modal) {
    web3Modal = new Web3Modal({ cacheProvider: true });
  }

  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      setHasMetaMask(false);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!hasMetaMask) {
    return (
      <>
        <svg style={{ display: "none" }}>
          <filter id="glass-distortion">
            <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
          </filter>
        </svg>

        <div className="install-ui-wrapper">
          <div className="install-ui-container">
            <h1 className="install-ui-title">Send Ethereum<br />with MetaMask</h1>

            <div className="install-ui-card glass-card">
              <div className="glass-filter"></div>
              <div className="glass-distortion-overlay"></div>
              <div className="glass-overlay"></div>
              <div className="glass-specular"></div>

              <div className="glass-content install-left">
                <p className="install-text">To continue, please install the MetaMask extension.</p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="install-btn">Get MetaMask</button>
                </a>
              </div>

              <div className="glass-content install-right">
                <img src={foxLogo} alt="MetaMask Fox" className="fox-svg" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setSigner(signer);
      setAccount(address);
      const rawBalance = await provider.getBalance(address);
      setBalance(parseFloat(ethers.utils.formatEther(rawBalance)).toFixed(4));
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  const disconnectWallet = async () => {
    try {
      await web3Modal.clearCachedProvider();
      if (signer?.provider?.provider?.disconnect) {
        await signer.provider.provider.disconnect();
      }
      setSigner(null);
      setAccount("");
      setBalance("");
      setRecipient("");
      setAmount("");
      setStatus("");
      setShowWalletInfo(false);
    } catch (err) {
      console.error("Disconnect failed", err);
    }
  };

  const sendTransaction = async () => {
    if (!signer || !recipient || !amount) {
      setStatus("Fill in all fields correctly.");
      return;
    }

    try {
      setStatus("Sending...");
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      setStatus(`✅ Transaction successful! Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Transaction failed", error);
      setStatus("❌ Transaction failed. Check console.");
    }
  };

  return (
    <div className="wallet-page">
      <h1 className="wallet-heading">SEND&nbsp;CRYPTO</h1>

      {account && (
        <button
          className="wallet-toggle-btn"
          onClick={() => setShowWalletInfo((prev) => !prev)}
        >
          {showWalletInfo ? "Hide Wallet Info" : "View Wallet Info"}
        </button>
      )}

      {account && showWalletInfo && (
        <div className="wallet-info-box">
          <p className="wallet-info-label">Address:</p>
          <p className="wallet-info-value">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <p className="wallet-info-label">Balance:</p>
          <p className="wallet-info-value">{balance} ETH</p>
        </div>
      )}

      {isMobile ? (
        <div className="mobile-message">
          <p>Please use a desktop to access this page.</p>
        </div>
      ) : (
        <div className={`wallet-card glass-card ${!account ? "centered" : ""}`}>
          {/* GLASS LAYERS */}
          <div className="glass-filter"></div>
          <div className="glass-distortion-overlay"></div>
          <div className="glass-overlay"></div>
          <div className="glass-specular"></div>

          {/* NON-BLURRED CONTENT */}
          <div className="glass-content">
            <div className="eth-token-header">
              <img src={ethLogo} alt="Ethereum" />
              <span>Ethereum</span>
            </div>

            {!account ? (
              <button className="wallet-btn primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <>
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Ethereum Amount</label>
                  <input
                    type="number"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <button className="wallet-btn send" onClick={sendTransaction}>
                  SEND
                </button>

                {status && <p className="wallet-status">{status}</p>}

                <button className="wallet-btn disconnect" onClick={disconnectWallet}>
                  DISCONNECT
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
