// Marketplace.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { marketplaceABI } from './MarketplaceABI';
import { marketplaceAddress } from '../config';
import './Marketplace.css';

// Images
import Cerbeus from '../assets/images/Cerberus.jpg';
import Aegis from '../assets/images/Aegis.jpg';
import Helios from '../assets/images/Helios.jpg';
import Orpheus from '../assets/images/Orpheus.jpg';

const mockFeaturedNFTs = [
  {
    tokenId: 101,
    price: "0.15",
    totalFee: "0.00075",
    image: Aegis,
    name: "Aegis Shield",
    description: "Legendary shield wielded by the gods.",
    owner: "0xAbc...1234",
  },
  {
    tokenId: 102,
    price: "0.3",
    totalFee: "0.00075",
    image: Helios,
    name: "Helios Spear",
    description: "Spear that commands the sun's fury.",
    owner: "0xDef...5678",
  },
  {
    tokenId: 103,
    price: "0.2",
    totalFee: "0.00075",
    image: Orpheus,
    name: "Orpheus Lyre",
    description: "A lyre that enchants souls.",
    owner: "0xFgh...9012",
  },
  {
    tokenId: 104,
    price: "0.18",
    totalFee: "0.00075",
    image: Cerbeus,
    name: "Cerberus",
    description: "A three-headed hound.",
    owner: "0xIjk...3456",
  },
];

function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [wallet, setWallet] = useState(null);

  const showAlert = (message) => {
    setAlert(message);
    setTimeout(() => setAlert(null), 5000);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
    } else {
      showAlert('Please install MetaMask.');
    }
  };

  const loadMarketplaceItems = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
      const data = await contract.fetchMarketItems();
      const listingFee = await contract.getListingPrice();
      const mintingFee = await contract.getMintingFee();
      const totalFee = listingFee.add(mintingFee);

      const itemsFormatted = await Promise.all(
        data.map(async item => {
          const tokenURI = await contract.tokenURI(item.tokenId);
          const response = await fetch(tokenURI);
          const metadata = await response.json();

          return {
            tokenId: item.tokenId.toNumber(),
            price: ethers.utils.formatEther(item.price),
            totalFee: ethers.utils.formatEther(totalFee),
            image: metadata.image,
            name: metadata.name,
            description: metadata.description,
            owner: item.seller,
          };
        })
      );
      setItems(itemsFormatted);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async (tokenId, price) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const transaction = await contract.createMarketSale(tokenId, {
        value: ethers.utils.parseEther(price),
      });
      await transaction.wait();

      showAlert("NFT Purchased!");
      loadMarketplaceItems();
    } catch (error) {
      console.error("Purchase failed:", error);
      showAlert("Purchase failed. Please try again.");
    }
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  return (
    <div className="market-container">
      {/* Alert */}
      {alert && <div className="market-alert">{alert}</div>}

      {/* Featured Carousel */}
      <h2 className="market-title">Featured Artifacts</h2>
      <div className="market-carousel">
        {mockFeaturedNFTs.map((nft, i) => (
          <div key={i} className="market-featured-card">
            <img src={nft.image} alt={nft.name} className="market-featured-img" />
            <h4>{nft.name}</h4>
            <p>{nft.description}</p>
            <span>{nft.price} ETH</span>
          </div>
        ))}
      </div>

      {/* Marketplace Grid */}
      <h2 className="market-title">Latest Artifacts</h2>
      {loading ? <p>Loading...</p> : (
        <div className="market-grid">
          {items.map((nft, i) => (
            <div key={i} className="market-card">
              <img src={nft.image} alt={nft.name} className="market-card-img" />
              <h4>{nft.name}</h4>
              <p>{nft.description}</p>
              <div className="market-card-footer">
                <span>{nft.price} ETH</span>
                <button className="market-view-btn" onClick={() => setSelectedNFT(nft)}>View</button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFT Modal */}
      {selectedNFT && (
        <div className="market-modal">
          <div className="market-modal-content">
            <div className="market-modal-left">
              <img src={selectedNFT.image} alt={selectedNFT.name} />
              <button onClick={() => buyNFT(selectedNFT.tokenId, selectedNFT.price)}>Buy</button>
            </div>
            <div className="market-modal-right">
              <h3>{selectedNFT.name}</h3>
              <p>{selectedNFT.description}</p>
              <p><strong>Owner:</strong> {selectedNFT.owner}</p>
              <p><strong>Price:</strong> {selectedNFT.price} ETH</p>
              <button onClick={() => setSelectedNFT(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketplace;
