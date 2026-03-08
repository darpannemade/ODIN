import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { marketplaceABI } from './MarketplaceABI';
import { marketplaceAddress } from '../config';
import './Marketplace.css';

import Cerbeus from '../assets/images/Cerberus.jpg';
import Aegis from '../assets/images/Aegis.jpg';
import Helios from '../assets/images/Helios.jpg';
import Orpheus from '../assets/images/Orpheus.jpg';

const SEPOLIA_CHAIN_ID = 11155111;

const mockFeaturedNFTs = [
  { tokenId: 101, price: "0.15", image: Aegis, name: "Aegis Shield", description: "Legendary shield wielded by the gods.", owner: "0xAbc...1234" },
  { tokenId: 102, price: "0.3", image: Helios, name: "Helios Spear", description: "Spear that commands the sun's fury.", owner: "0xDef...5678" },
  { tokenId: 103, price: "0.2", image: Orpheus, name: "Orpheus Lyre", description: "A lyre that enchants souls.", owner: "0xFgh...9012" },
  { tokenId: 104, price: "0.18", image: Cerbeus, name: "Cerberus", description: "A three-headed hound.", owner: "0xIjk...3456" },
];

const resolveIPFS = (url) => {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return url;
};

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const ensureSepolia = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    
    // ethers v6 network.chainId is a bigint
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia hex
        });
        return true;
      } catch {
        toast.error("Please switch to Sepolia network in MetaMask.");
        return false;
      }
    }
    return true;
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected.');
      return;
    }
    const ok = await ensureSepolia();
    if (!ok) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setWallet(accounts[0]);
    } catch (e) {
      console.error(e);
      toast.error("Connection rejected.");
    }
  };

  const loadMarketplaceItems = async () => {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }
    // Guard: placeholder address means contract isn't deployed yet
    if (!marketplaceAddress || marketplaceAddress.includes("Your") || !marketplaceAddress.startsWith("0x") || marketplaceAddress.length !== 42) {
      setLoading(false);
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
      const data = await contract.fetchMarketItems();

      const itemsFormatted = await Promise.all(
        data.map(async item => {
          try {
            const tokenURI = resolveIPFS(await contract.tokenURI(item.tokenId));
            const response = await fetch(tokenURI);
            const metadata = await response.json();

            return {
              tokenId: item.tokenId.toString(), // converting BigInt
              price: ethers.utils.formatEther(item.price),
              image: resolveIPFS(metadata.image),
              name: metadata.name,
              description: metadata.description,
              owner: item.seller,
            };
          } catch {
            return null;
          }
        })
      );

      setItems(itemsFormatted.filter(Boolean));
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };


  const buyNFT = async (tokenId, price) => {
    if (!window.ethereum) {
      toast.error("Install MetaMask to purchase.");
      return;
    }
    const ok = await ensureSepolia();
    if (!ok) return;

    const toastId = toast.loading("Processing purchase...");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const transaction = await contract.createMarketSale(tokenId, {
        value: ethers.utils.parseEther(price),
      });
      
      toast.loading("Awaiting blockchain engraving...", { id: toastId });
      await transaction.wait();

      toast.success("Relic Acquired!", { id: toastId });
      setSelectedNFT(null);
      loadMarketplaceItems();
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error(error.reason || "Purchase failed.", { id: toastId });
    }
  };

  useEffect(() => {
    loadMarketplaceItems();
    
    // Check initial wallet state silently
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if(accounts.length > 0) setWallet(accounts[0]);
      });
      
      const handleAccounts = (accs) => {
        setWallet(accs[0] || null);
        loadMarketplaceItems();
      };
      
      window.ethereum.on("accountsChanged", handleAccounts);
      window.ethereum.on("chainChanged", () => window.location.reload());

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccounts);
      };
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="marketplace-container">
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />

      {/* HEADER AREA */}
      <div className="market-header">
        <div>
          <h1 className="market-title">The <span className="text-aurora">Astral Bazaar</span></h1>
          <p className="text-muted text-sm tracking-wide mt-2">Discover, collect, and trade cosmic relics.</p>
        </div>
        
        {!wallet && (
          <button className="btn-aether text-sm" onClick={connectWallet}>
            Link Treasury to Trade
          </button>
        )}
      </div>

      <div className="aether-line mb-10 w-full" />

      {/* TIER 1: FEATURED */}
      <h2 className="section-title mb-6 flex items-center gap-3">
        <span className="text-xl">✨</span> 
        Featured Artifacts
      </h2>
      
      <div className="market-featured-grid mb-12">
        {mockFeaturedNFTs.map((nft, i) => (
          <motion.div 
            key={i} 
            className="nft-card aether-card featured"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setSelectedNFT(nft)}
          >
            <div className="card-img-wrapper">
              <img src={nft.image} alt={nft.name} className="card-img" />
              <div className="card-badge">Mythic</div>
            </div>
            <div className="card-info">
              <h4 className="card-name">{nft.name}</h4>
              <p className="card-desc text-muted">{nft.description}</p>
              <div className="card-footer">
                <span className="card-price text-aurora font-mono">{nft.price} ETH</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TIER 2: LIVE MARKET */}
      <h2 className="section-title mb-6 flex items-center gap-3">
        <span className="text-xl">🌌</span> 
        Recently Minted from the Forge
      </h2>

      {loading ? (
        <div className="market-state-display aether-card">
          <div className="spinner-border mb-4 text-aurora w-8 h-8" />
          <p className="font-mono text-sm uppercase tracking-widest text-muted">Reading the Aether...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="market-state-display aether-card">
          <div className="nav-brand-rune opacity-50 mb-4 mx-auto" style={{ width: 48, height: 48 }} />
          <p className="font-mono text-sm uppercase tracking-widest text-muted">No relics currently listed.</p>
        </div>
      ) : (
        <motion.div 
          className="market-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {items.map((nft, i) => (
            <motion.div 
              key={i} 
              className="nft-card aether-card"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: 'var(--shadow-aurora)' }}
              onClick={() => setSelectedNFT(nft)}
            >
              <div className="card-img-wrapper">
                <img src={nft.image} alt={nft.name} className="card-img" loading="lazy" />
              </div>
              <div className="card-info">
                <h4 className="card-name">{nft.name}</h4>
                <div className="card-footer mt-4">
                  <span className="card-price font-mono text-primary">{nft.price} ETH</span>
                  <span className="owner-tag">{nft.owner.slice(0,6)}...</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* PURCHASE / VIEW MODAL */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div 
              className="market-modal-content aether-card glow-border p-0 overflow-hidden flex flex-col md:flex-row"
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 900, width: '90%' }}
            >
              
              <div className="modal-img-col w-full md:w-1/2 bg-black relative">
                <img 
                  src={selectedNFT.image} 
                  alt={selectedNFT.name} 
                  className="w-full h-full object-cover aspect-square md:aspect-auto" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
              
              <div className="modal-info-col w-full md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-3xl font-bold text-white">{selectedNFT.name}</h3>
                  <button className="text-muted hover:text-white transition-colors" onClick={() => setSelectedNFT(null)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                
                <p className="text-secondary leading-relaxed mb-6 flex-grow">{selectedNFT.description}</p>
                
                <div className="bg-black/40 rounded-lg p-4 mb-8 border border-white/5">
                  <span className="text-xs uppercase tracking-widest text-muted block mb-1">Current Owner</span>
                  <span className="font-mono text-sm text-aurora">{selectedNFT.owner}</span>
                </div>

                <div className="flex items-end justify-between border-t border-white/10 pt-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted block mb-1">Current Price</span>
                    <span className="font-display text-4xl font-bold text-white flex items-center gap-2">
                      <span className="text-aurora">Ξ</span> {selectedNFT.price}
                    </span>
                  </div>
                  
                  <button 
                    className="btn-aether py-3 px-8 text-lg" 
                    onClick={() => buyNFT(selectedNFT.tokenId, selectedNFT.price)}
                  >
                    Acquire Relic
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
