import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import "./ChatBotUI.css";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { ethers } from "ethers";
import contractJson from "../NFTmarket/contractABI/NFTMarketplace.json";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { MintContext } from "../context/MintContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Assets
import odinbg1 from "../assets/bgchatbot.jpg";
import metamaskLogo from "../assets/images/walletpage/fox.png";

const ODIN_EYE_KEY = "odin_eye_v3";


/* ─────────────────────────────────────────────────────
   OdinEyeIntro — fast, self-contained, no external deps
───────────────────────────────────────────────────── */
function OdinEyeIntro({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      sessionStorage.setItem(ODIN_EYE_KEY, '1');
      onDone();
    }, 600);
  }, [onDone, leaving]);

  useEffect(() => {
    const t = setTimeout(dismiss, 2800);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <div style={{
      position:        'fixed',
      inset:           0,
      zIndex:          9999,
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      background:      'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,8,70,0.35) 0%, transparent 80%), #04040d',
      cursor:          'pointer',
      opacity:          leaving ? 0 : 1,
      transition:       'opacity 0.6s ease',
      willChange:       'opacity',
    }} onClick={dismiss}>

      {/* Animated eye SVG */}
      <svg viewBox="0 0 160 100" width="220" style={{ overflow: 'visible', marginBottom: '2rem' }}>
        <defs>
          <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0.95"/>
            <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#04040d"  stopOpacity="1"/>
          </radialGradient>
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Outer eye shape — clips open via CSS animation */}
        <path
          d="M 0 50 Q 80 -20 160 50 Q 80 120 0 50 Z"
          fill="none"
          stroke="rgba(0,212,255,0.70)"
          strokeWidth="1.5"
          filter="url(#eyeGlow)"
          style={{ animation: 'eyeOpen 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
        />

        {/* Iris */}
        <circle
          cx="80" cy="50" r="22"
          fill="url(#irisGrad)"
          filter="url(#eyeGlow)"
          style={{ animation: 'eyeOpen 0.65s cubic-bezier(0.16,1,0.3,1) 0.35s both', transformOrigin: '80px 50px' }}
        />

        {/* Pupil */}
        <circle
          cx="80" cy="50" r="9"
          fill="#020208"
          style={{ animation: 'eyeOpen 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both', transformOrigin: '80px 50px' }}
        />

        {/* Iris ring detail */}
        <circle
          cx="80" cy="50" r="18"
          fill="none"
          stroke="rgba(0,212,255,0.35)"
          strokeWidth="1"
          style={{ animation: 'eyeOpen 0.6s 0.55s both', transformOrigin: '80px 50px' }}
        />

        {/* Subtle glow halo */}
        <ellipse
          cx="80" cy="50" rx="50" ry="28"
          fill="rgba(139,92,246,0.08)"
          filter="url(#eyeGlow)"
          style={{ animation: 'eyeOpen 1s 0.3s both' }}
        />
      </svg>

      {/* Title */}
      <div style={{
        overflow:  'hidden',
        animation: 'titleUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s both',
      }}>
        <p style={{
          fontFamily:    "'Cinzel', Georgia, serif",
          fontSize:      'clamp(0.7rem, 1.6vw, 1rem)',
          letterSpacing: '0.42em',
          color:         'rgba(0,212,255,0.70)',
          textTransform: 'uppercase',
          margin:        0,
        }}>
          Odin&rsquo;s Eye
        </p>
      </div>

      <p style={{
        fontFamily:    "'Cormorant Garamond', Georgia, serif",
        fontStyle:     'italic',
        fontSize:      'clamp(0.5rem, 1vw, 0.65rem)',
        letterSpacing: '0.28em',
        color:         'rgba(139,92,246,0.45)',
        margin:        '0.6rem 0 0',
        animation:     'titleUp 0.5s cubic-bezier(0.16,1,0.3,1) 1.1s both',
      }}>
        initializing consciousness
      </p>

      {/* Keyframes injected inline — system fonts only, no extra HTTP request */}
      <style>{`
        @keyframes eyeOpen {
          from { opacity: 0; transform: scaleY(0.1); }
          to   { opacity: 1; transform: scaleY(1); }
        }
        @keyframes titleUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}





export default function ChatBotUI() {
  const [walletAddress, setWalletAddress] = useState("");
  const [prompt, setPrompt] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [walletVerified, setWalletVerified] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { user, authLoading } = useContext(AuthContext);
  const { setNftData } = useContext(MintContext);
  const navigate = useNavigate();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const [showExportModal, setShowExportModal] = useState(false);
  // Show intro only on first session visit
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(ODIN_EYE_KEY));

  const [expectingMintData, setExpectingMintData] = useState(false);
  const [mintStep, setMintStep] = useState(0);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintInputs, setMintInputs] = useState({ name: "", description: "", price: "" });
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const chatBottomRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, botResponse, loading]);

  // ─── Intro done callback ───
  const handleIntroDone = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    // Clean up old localStorage keys from previous implementation
    // (We now use sessionStorage with scoped keys for Odin's Eye)
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("wallet_verified");

    // Restore Odin's Eye wallet from sessionStorage — session-scoped only.
    // Using sessionStorage (not localStorage) ensures this is INDEPENDENT of the
    // global Wallet page connection. A fresh page load / new tab always starts
    // unconnected, so the Wallet page connection never bleeds into Odin's Eye.
    const restoreWallet = async () => {
      const storedAddress = sessionStorage.getItem("odin_eye_address");
      const storedVerified = sessionStorage.getItem("odin_eye_verified") === "true";

      if (storedAddress && storedVerified && window.ethereum) {
        try {
          // Confirm MetaMask still has this account in the current session
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          const stillConnected = accounts.some(
            (a) => a.toLowerCase() === storedAddress.toLowerCase()
          );

          if (stillConnected) {
            setWalletAddress(storedAddress);
            setWalletVerified(true);
          } else {
            sessionStorage.removeItem("odin_eye_address");
            sessionStorage.removeItem("odin_eye_verified");
          }
        } catch {
          sessionStorage.removeItem("odin_eye_address");
          sessionStorage.removeItem("odin_eye_verified");
        }
      }
      // Never auto-call connectWallet() — user must explicitly click Connect
    };

    restoreWallet();
  }, [user, authLoading]);

  const logoutWallet = () => {
    sessionStorage.removeItem("odin_eye_address");
    sessionStorage.removeItem("odin_eye_verified");
    setWalletAddress("");
    setWalletVerified(false);
    toast("Wallet disconnected from Odin's Eye", { icon: "👋" });
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    if (authLoading) {
      toast("Please wait, checking session...");
      setIsConnecting(false);
      return;
    }
    if (!user?.email) {
      toast.error("Please log in to link your wallet.");
      navigate("/login");
      setIsConnecting(false);
      return;
    }
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not detected.");
        setIsConnecting(false);
        return;
      }

      // Always request accounts explicitly — this triggers MetaMask popup
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Save to session-scoped storage (not localStorage) so it doesn't bleed
      // into other pages or persist across browser restarts
      setWalletAddress(address);
      sessionStorage.setItem("odin_eye_address", address);

      // Signature-based verification — requires backend /sign-challenge endpoint
      const verified = await verifyWalletOwnership(address);
      if (!verified) {
        toast.error("Signature verification failed. Try reconnecting.");
        // Still set the address so user sees they are connected, but unverified
      } else {
        toast.success("Wallet linked securely to Odin's Eye.");
      }
    } catch (err) {
      console.error(err);
      if (err.code === 4001) {
        toast.error("Connection rejected in MetaMask.");
      } else {
        toast.error("Could not connect — check MetaMask.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const verifyWalletOwnership = async (address) => {
    if (!user?.email || !address) return false;
    try {
      const res = await fetch(`${API_BASE}/sign-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, user_email: user.email }),
      });

      if (!res.ok) throw new Error("Backend unavailable");

      const data = await res.json();
      const challenge = data.challenge;

      // Ask MetaMask to sign the challenge — this prompts the user
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(challenge);

      const verifyRes = await fetch(`${API_BASE}/verify-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, user_email: user.email }),
      });
      const { verified } = await verifyRes.json();
      setWalletVerified(verified);
      // Save to sessionStorage — Odin's Eye only, not shared with Wallet page
      if (verified) sessionStorage.setItem("odin_eye_verified", "true");
      return verified;
    } catch (e) {
      // Backend offline or signature cancelled — wallet connects as unverified
      console.warn("Signature verification skipped:", e.message);
      setWalletVerified(false);
      return false;
    }
  };

  const toggleWalletConnection = () => {
    if (walletAddress) logoutWallet();
    else connectWallet();
  };

  const sendMessage = async () => {
    if (!prompt.trim() && !expectingMintData) return;
    
    const userPrompt = prompt;
    setPrompt(""); // Clear input immediately
    
    // Add to UI immediately
    if (userPrompt) {
      setChatHistory(prev => [...prev, { role: "user", content: userPrompt }]);
    }

    // 1. Check ETH Transfer intent
    const sendEthMatch = userPrompt.toLowerCase().match(/send\s+([\d.]+)\s*eth\s+to\s+(0x[a-f0-9]{40})/i);
    if (sendEthMatch) {
      const [, ethAmount, toAddress] = sendEthMatch;
      await handleSendETH(toAddress, ethAmount);
      return;
    }

    // 2. Check Minting Intent
    if (!expectingMintData && userPrompt.toLowerCase().includes("mint nft")) {
      const msg = "Let's mint your relic in the cosmic forge! Please upload an image below to begin.";
      setChatHistory(prev => [...prev, { role: "bot", content: msg }]);
      setExpectingMintData(true);
      setTimeout(() => fileInputRef.current?.click(), 1000);
      return;
    }

    if (expectingMintData && mintStep === 1) {
      const [name, description, price] = userPrompt.split(",").map(s => s.trim());
      if (!name || !description || !price) {
        setChatHistory(prev => [...prev, { role: "bot", content: "⚠️ Format must be: [Name], [Description], [Price]" }]);
        return;
      }
      setMintInputs({ name, description, price });
      setChatHistory(prev => [...prev, { 
        role: "bot", 
        content: `Data saved. \nName: ${name} \nPrice: ${price} ETH \nType **confirm** to forge or **cancel** to abort.` 
      }]);
      setMintStep(2);
      return;
    }

    if (expectingMintData && mintStep === 2) {
      if (userPrompt.toLowerCase().includes("confirm")) {
        handleMintConfirm();
        return;
      } else if (userPrompt.toLowerCase().includes("cancel")) {
        resetMinting();
        setChatHistory(prev => [...prev, { role: "bot", content: "❌ Minting ritual cancelled." }]);
        return;
      }
    }

    // 3. Regular AI Chat
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.uid || walletAddress || "guest",
          prompt: userPrompt,
          wallet_info: {
            eth_balance: "0.0", // would normally pass real balance here
            address: walletAddress || "guest",
            user_email: user?.email || "",
          },
        }),
      });

      const data = await res.json();
      const [response] = data.response.split("\n\n💡 ");
      setChatHistory(prev => [...prev, { role: "bot", content: response }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "bot", content: "❌ Contact lost with the Aether. Service offline." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendETH = async (to, amount) => {
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      setChatHistory(prev => [...prev, { role: "bot", content: `Initiating transfer of ${amount} ETH. Awaiting wallet confirmation...` }]);
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });

      setChatHistory(prev => [...prev, { role: "bot", content: `📤 Transaction sent to the Aether! \nHash: ${tx.hash}` }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "bot", content: `❌ Failed to send ETH: ${err.reason || err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setChatHistory(prev => [...prev, { 
        role: "bot", 
        content: "Image received. Now enter the details in this exact format: \n`[Name], [Description], [Price in ETH]`" 
      }]);
      setMintStep(1);
    }
  };

  const handleMintConfirm = async () => {
    if (!imageFile || !mintInputs.name || !mintInputs.description || !mintInputs.price) {
      toast.error("All minting fields required");
      return;
    }
    setLoading(true);
    setChatHistory(prev => [...prev, { role: "bot", content: "Forging your relic... Please approve the transaction in your wallet." }]);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

      const mintFee = await contract.getMintingFee();
      const listingFee = await contract.getListingPrice(); 
      const mintPrice = ethers.utils.parseEther(mintInputs.price);
      const totalFee = mintFee + listingFee; // BrowserProvider way

      const tx = await contract.createToken("ipfs://dummy-url", mintPrice, { value: totalFee });
      await tx.wait();
      
      setChatHistory(prev => [...prev, { role: "bot", content: "🎉 Relic successfully minted and bound to the blockchain!" }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "bot", content: `❌ Forge failed: ${err.reason || err.message}` }]);
    } finally {
      resetMinting();
      setLoading(false);
    }
  };

  const resetMinting = () => {
    setExpectingMintData(false);
    setImageFile(null);
    setImagePreview(null);
    setMintInputs({ name: "", description: "", price: "" });
    setMintStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportChat = (format) => {
    const text = chatHistory
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}\n`)
      .join("\n\n");

    if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(12);
      // split text to fit page
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 10, 20);
      doc.save("odin_logs.pdf");
    } else {
      const blob = new Blob([text], { type: "text/plain" });
      saveAs(blob, `odin_logs.${format}`);
    }
    setShowExportModal(false);
    toast.success(`Chat exported as ${format.toUpperCase()}`);
  };

  const suggestions = [
    "Explain Ethereum in simple terms",
    "How do NFTs work?",
    "Send 0.05 ETH to 0x123...456",
    "Mint NFT",
    "What is the Aether?",
    "What is Odin's Eye?"
  ];

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />
      
      {/* Odin's Eye Intro — overlays ON TOP while main content loads underneath */}
      {showIntro && <OdinEyeIntro onDone={handleIntroDone} />}

      {/* Main Chat App — always renders so it loads in background during intro */}
      <div className="chatui-wrapper" style={{ visibility: showIntro ? 'hidden' : 'visible' }}>
          {/* We keep the original bg image but apply Aether overlays */}
          <div className="chatui-bg-image" style={{ backgroundImage: `url(${odinbg1})` }} />
          <div className="chatui-bg-overlay" />
          
          <div className="chatui-container glass glow-border">
            
            {/* SIDEBAR */}
            <div className="chatui-sidebar">
              <div className="sidebar-header">
                <div className="nav-brand-rune small mx-auto mb-2" />
                <h2 className="sidebar-brand text-center">ODIN'S EYE</h2>
                <div className="aether-line mx-auto mb-6" />
              </div>

              {/* Wallet Status Area */}
              <div className="sidebar-wallet-card">
                <button
                  className={`btn-wallet-connect ${walletAddress ? 'connected' : ''}`}
                  onClick={toggleWalletConnection}
                  disabled={isConnecting}
                >
                  <img src={metamaskLogo} alt="MM" style={{ width: '20px' }} />
                  {isConnecting ? "Connecting..." : walletAddress ? "Disconnect Wallet" : "Connect MetaMask"}
                </button>

                {walletAddress && (
                  <div className={`wallet-status ${walletVerified ? 'verified' : 'unverified'}`}>
                    <span className="status-dot"></span>
                    {walletVerified ? "Session Verified" : "Unverified Session"}
                  </div>
                )}
              </div>

              <div className="sidebar-suggestions">
                <h3 className="suggestions-title">Quick Spells</h3>
                <ul className="suggestions-list">
                  {suggestions.map((s, i) => (
                    <li key={i} onClick={() => setPrompt(s)}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="chatui-main">
              {walletAddress ? (
                <>
                  <div className="chatui-header">
                    <div>
                      <h1 className="chatui-heading">
                        Commune with <span className="text-aurora">The Eye</span>
                      </h1>
                      <p className="chatui-subheading">I see the Aether. Ask me anything, or command me to interact with the blockchain.</p>
                    </div>
                    <button className="btn-rune btn-sm" onClick={() => setShowExportModal(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Logs
                    </button>
                  </div>

                  <div className="chatui-messages custom-scrollbar">
                    {chatHistory.length === 0 && (
                      <div className="empty-chat-state">
                        <div className="eye-orb float"></div>
                        <p>The Eye is listening...</p>
                      </div>
                    )}
                    
                    {chatHistory.map((msg, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`message-wrapper ${msg.role}`} 
                        key={idx}
                      >
                        <div className="message-bubble glass">
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}

                    {/* Mint Image Preview inside chat */}
                    {imagePreview && expectingMintData && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-wrapper user">
                        <div className="message-bubble glass">
                          <img src={imagePreview} alt="Upload preview" className="chat-img-preview" />
                        </div>
                      </motion.div>
                    )}

                    {loading && (
                      <div className="message-wrapper bot">
                        <div className="message-bubble glass typing">
                          <span>.</span><span>.</span><span>.</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <div className="chatui-input-wrapper">
                    <input
                      type="text"
                      className="chatui-input"
                      placeholder="Cast a spell or ask a question..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      disabled={loading || (expectingMintData && mintStep === 0 && !imageFile)}
                    />
                    <button 
                      className="chatui-send" 
                      onClick={sendMessage}
                      disabled={!prompt.trim() || loading}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </>
              ) : (
                <div className="chatui-unauth-state">
                  <div className="nav-brand-rune mx-auto" style={{ width: 64, height: 64, marginBottom: '2rem' }} />
                  <h2>The Eye Requires Access</h2>
                  <p>You must connect your MetaMask to the Aether to speak with Odin's Eye.</p>
                  <button className="btn-aether mt-8" onClick={connectWallet} disabled={isConnecting}>
                    {isConnecting ? "Establishing Link..." : "Connect Treasury"}
                  </button>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowExportModal(false)}
          >
            <motion.div 
              className="modal-content glass glow-border"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>Export Akashic Records</h3>
              <p className="text-muted mb-6">Download your conversation history with Aether in your preferred format.</p>
              
              <div className="modal-buttons">
                <button className="btn-rune w-full" onClick={() => exportChat("md")}>Markdown (.md)</button>
                <button className="btn-rune w-full" onClick={() => exportChat("pdf")}>PDF (.pdf)</button>
                <button className="btn-rune w-full" onClick={() => exportChat("txt")}>Text (.txt)</button>
              </div>
              
              <button className="btn-text w-full mt-4" onClick={() => setShowExportModal(false)}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
