import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { motion, AnimatePresence } from "framer-motion";
import metamaskLogo from "../assets/images/walletpage/fox.png";
import ethLogo from "../assets/images/hero/ethereum.png";
import "./WalletPage.css";
import toast, { Toaster } from "react-hot-toast";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; 

export default function WalletPage() {
  const { address: account, connectWallet } = useWeb3();
  const [balance, setBalance] = useState("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkOk, setNetworkOk] = useState(true);

  // Check network & fetch balance
  useEffect(() => {
    const checkNetworkAndBalance = async () => {
      if (window.ethereum && account) {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          setNetworkOk(chainId === SEPOLIA_CHAIN_ID);
          fetchBalance(account);
        } catch (err) {
          console.error("Network check failed:", err);
        }
      }
    };
    checkNetworkAndBalance();
  }, [account]);

  // Listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (chainId) => {
        setNetworkOk(chainId === SEPOLIA_CHAIN_ID);
        if (chainId !== SEPOLIA_CHAIN_ID) {
          toast.error("Please switch to Sepolia testnet");
        }
      });
    }
  }, []);

  const fetchBalance = async (address) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balStr = await provider.getBalance(address);
      const balInEth = ethers.utils.formatEther(balStr);
      setBalance(Number(balInEth).toFixed(4));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found!");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err) {
      toast.error("Could not switch to Sepolia. Add it to MetaMask manually.");
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!window.ethereum || !account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!networkOk) {
      toast.error("Switch to Sepolia network first");
      return;
    }
    if (!recipient || !amount) {
      toast.error("Enter recipient and amount");
      return;
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    
    setLoading(true);
    const notificationId = toast.loading("Forging transaction...");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      });

      toast.loading("Awaiting confirmation from the Aether...", { id: notificationId });
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`Sent ${amount} ETH successfully!`, { id: notificationId });
        setAmount("");
        setRecipient("");
        fetchBalance(account);
      } else {
        toast.error("Transaction failed", { id: notificationId });
      }
    } catch (err) {
      console.error("Send error:", err);
      toast.error(err.reason || err.message || "Transaction Rejected", { id: notificationId });
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="wallet-page page-enter">
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />
      <div className="cosmic-bg" />

      <motion.div 
        className="container wallet-container"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp} className="wallet-header text-center">
          <div className="aether-line mx-auto" style={{ margin: "0 auto 1.5rem" }} />
          <h1 className="wallet-title">Cosmic <span className="text-aurora">Treasury</span></h1>
          <p className="wallet-subtitle">Manage your Ether across the Bifrost. Requires Sepolia testnet.</p>
        </motion.div>

        {!account ? (
          // NOT CONNECTED STATE
          <motion.div variants={fadeUp} className="wallet-card connect-card aether-card glow-border">
            <div className="metamask-logo-wrapper">
              <div className="pulse-ring"></div>
              <img src={metamaskLogo} alt="MetaMask" className="wallet-logo-img" />
            </div>
            <h2>Unlock Your Treasury</h2>
            <p className="text-muted mb-8">Connect your MetaMask wallet to view your balance and forge transactions.</p>
            <button className="btn-aether btn-lg" onClick={connectWallet}>
              <img src={metamaskLogo} alt="MM" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
              Connect Wallet
            </button>
            
          </motion.div>
        ) : (
          // CONNECTED STATE
          <motion.div variants={fadeUp} className="wallet-grid">
            
            {/* LEFT: INFO CARD */}
            <div className="wallet-card info-card aether-card glow-border">
              <div className="wallet-card-header">
                <h3>Treasury Status</h3>
                <div className={`network-badge ${networkOk ? 'active' : 'error'}`}>
                  {networkOk ? "● Sepolia" : "● Wrong Network"}
                </div>
              </div>

              {!networkOk && (
                <div className="network-warning glass">
                  <p>You are connected to the wrong network. The Cosmic Forge requires Sepolia.</p>
                  <button onClick={switchToSepolia} className="btn-rune btn-sm mt-4">Switch Network</button>
                </div>
              )}

              <div className="balance-display mt-8">
                <span className="balance-label text-muted">Aether Balance</span>
                <div className="balance-value-wrapper">
                  <img src={ethLogo} alt="ETH" className="eth-icon-sm float" />
                  <span className="balance-value">{balance}</span>
                  <span className="balance-currency text-aurora">ETH</span>
                </div>
              </div>

              <div className="address-display mt-8">
                <span className="balance-label text-muted">Connected Runesmith</span>
                <div className="address-box glass">
                  {account.substring(0, 8)}...{account.substring(account.length - 6)}
                </div>
              </div>
            </div>

            {/* RIGHT: SEND CARD */}
            <div className="wallet-card send-card aether-card glow-border">
              <div className="wallet-card-header">
                <h3>Forge Transaction</h3>
              </div>

              <form onSubmit={handleSend} className="send-form mt-6">
                <div className="form-group">
                  <label>Recipient Address (0x...)</label>
                  <div className="input-with-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      disabled={loading || !networkOk}
                    />
                  </div>
                </div>

                <div className="form-group mt-6">
                  <label>Amount (ETH)</label>
                  <div className="input-with-icon">
                    <img src={ethLogo} alt="ETH" className="input-icon" style={{ width: "20px", height: "auto" }} />
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.05"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={loading || !networkOk}
                    />
                  </div>
                  <div className="amount-quick-actions mt-2">
                    {[0.01, 0.05, 0.1].map(val => (
                      <button 
                        key={val} 
                        type="button" 
                        className="btn-text btn-quick"
                        onClick={() => setAmount(val.toString())}
                        disabled={loading || !networkOk}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-aether w-full mt-8"
                  disabled={loading || !networkOk}
                >
                  {loading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                      </svg>
                      Transmitting to Aether...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Send Ethereum
                    </>
                  )}
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
