import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import { marketplaceAddress } from '../config';
import { marketplaceABI } from './MarketplaceABI';
import './MintNFT.css';

// Using the same fox logo from earlier pages
import foxLogo from '../assets/images/walletpage/fox.png';

export default function MintNFT() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Auto-connect if already authorized
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not detected! Please install it.");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success("Wallet connected to the Forge.");
    } catch (err) {
      console.error("Connection error:", err);
      toast.error("Failed to connect wallet.");
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    toast("Disconnected from the Forge", { icon: "👋" });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Upload to IPFS Pinata
  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const resFile = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      body: formData,
      headers: {
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET,
      },
    });

    const resFileData = await resFile.json();
    return `https://gateway.pinata.cloud/ipfs/${resFileData.IpfsHash}`;
  };

  const uploadMetadataToIPFS = async (imgUrl) => {
    const metadata = { name, description, image: imgUrl };

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      body: JSON.stringify(metadata),
      headers: {
        "Content-Type": "application/json",
        // Keeping original keys intact from old file, although they should be .env vars ideally
        pinata_api_key: "22257690d2eb4e3adb46",
        pinata_secret_api_key: "ccc5675ed7c389bcbeb154569416a98bfc522a13619c089a309aa5f80b75bc9c",
      },
    });

    const resData = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
  };

  const handleMint = async (e) => {
    e.preventDefault();

    if (!file || !name || !description || !price) {
      toast.error("All offerings must be provided to the Forge.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Forging Relic in the Aether...");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const userAddress = await signer.getAddress();

      const isBlacklisted = await contract.isBlacklisted(userAddress);
      if (isBlacklisted) {
        toast.error("You are banished from the Forge (Blacklisted).", { id: toastId });
        setLoading(false);
        return;
      }

      toast.loading("Uploading image to IPFS...", { id: toastId });
      const imageUrl = await uploadToIPFS(file);
      
      toast.loading("Uploading metadata to IPFS...", { id: toastId });
      const metadataUrl = await uploadMetadataToIPFS(imageUrl);

      const listingFee = await contract.getListingPrice();
      const mintingFee = await contract.getMintingFee();
      const totalFee = listingFee + mintingFee; // ethers v6 syntax
      
      const priceInWei = ethers.utils.parseEther(price);

      toast.loading("Awaiting wallet approval...", { id: toastId });
      const txn = await contract.createToken(metadataUrl, priceInWei, {
        value: totalFee,
      });

      toast.loading("Blockchain is engraving your relic...", { id: toastId });
      await txn.wait();

      setMintedNFTs([{ name, description, image: imageUrl, price }, ...mintedNFTs]);
      toast.success("Relic successfully forged!", { id: toastId });
      
      // Reset form
      setFile(null);
      setPreview(null);
      setName('');
      setDescription('');
      setPrice('');
    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("The Forge failed. See console.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="mint-page page-enter">
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />
      <div className="cosmic-bg" />
      
      <div className="container mint-container">
        
        <div className="mint-header text-center mb-8">
          <div className="nav-brand-rune mx-auto" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
          <h1 className="mint-title">The <span className="text-aurora">Cosmic Forge</span></h1>
          <p className="mint-subtitle text-muted">Bind your digital artifacts to the Aether blockchain.</p>
        </div>

        {!walletConnected ? (
          <motion.div 
            className="mint-connect-card aether-card text-center"
            initial="hidden" animate="visible" variants={fadeUp}
            style={{ maxWidth: 500, margin: '0 auto', padding: '4rem 2rem' }}
          >
            <div className="pulse-ring mx-auto mb-6" style={{ width: 80, height: 80, position: 'relative' }}>
              <img src={foxLogo} alt="MetaMask" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 2, position: 'relative' }} />
              <div style={{ position: 'absolute', inset: -10, border: '2px solid var(--aurora)', borderRadius: '50%', animation: 'ping 2s infinite' }} />
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Authentication Required
            </h2>
            <p className="text-secondary mb-6">
              To wield the power of the forge, you must first link your treasury.
            </p>
            <button className="btn-aether w-full" onClick={connectWallet}>
              Connect MetaMask
            </button>
          </motion.div>
        ) : (
          <div className="mint-grid">
            
            {/* LEFT: MINT FORM */}
            <motion.div 
              className="mint-form-area aether-card"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            >
              <div className="wallet-status-bar mb-6">
                <div className="wallet-pill">
                  <span className="dot rgb-success" />
                  <span className="address">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span>
                </div>
                <button className="btn-text" onClick={disconnectWallet}>Disconnect</button>
              </div>

              <h2 className="card-title">Relic Details</h2>
              <div className="aether-line mt-2 mb-6" style={{ width: '50px' }} />

              <form onSubmit={handleMint} className="mint-form">
                
                {/* Image Upload Area */}
                <div className="form-group mb-6">
                  <label>Relic Artifact (Image)</label>
                  <div className={`upload-zone ${preview ? 'has-image' : ''}`}>
                    {preview ? (
                      <div className="preview-container">
                        <img src={preview} alt="Preview" className="img-preview" />
                        <div className="preview-overlay" onClick={() => document.getElementById('file-upload').click()}>
                          <span>Change Artifact</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-prompt" onClick={() => document.getElementById('file-upload').click()}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-aurora mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <p>Click to browse the Aether</p>
                        <span className="text-muted text-xs">JPG, PNG, GIF, WEBP</span>
                      </div>
                    )}
                    <input 
                      id="file-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label>Relic Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Blade of the Cosmos"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={loading} 
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label>Lore / Description</label>
                  <textarea 
                    rows="3"
                    placeholder="Tell the tale of this artifact..."
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group mb-8">
                  <label>Tribute (Price in ETH)</label>
                  <div className="input-with-icon">
                    <span className="input-icon">Ξ</span>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.05"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-aether w-full btn-lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="spinner-border" /> Forging...
                    </span>
                  ) : "Forge Relic"}
                </button>
              </form>
            </motion.div>

            {/* RIGHT: RECENTLY MINTED OR PREVIEW */}
            <motion.div 
              className="mint-preview-area"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            >
              <h3 className="section-title mb-4">Forged in this Session</h3>
              
              {mintedNFTs.length === 0 ? (
                <div className="empty-state aether-card text-center" style={{ padding: '3rem 2rem' }}>
                  <div className="nav-brand-rune small opacity-50 mx-auto mb-4" />
                  <p className="text-muted text-sm uppercase tracking-widest">No relics forged yet</p>
                </div>
              ) : (
                <div className="minted-list custom-scrollbar">
                  <AnimatePresence>
                    {mintedNFTs.map((nft, idx) => (
                      <motion.div 
                        key={idx}
                        className="mint-success-card aether-card flex"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <img src={nft.image} alt={nft.name} className="mint-success-img" />
                        <div className="mint-success-info">
                          <h4>{nft.name}</h4>
                          <span className="price text-aurora font-mono">{nft.price} ETH</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
