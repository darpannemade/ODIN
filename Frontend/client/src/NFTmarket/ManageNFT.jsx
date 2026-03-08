import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTCard from "./NFTCard";
import "./ManageNFT.css";
import { marketplaceAddress } from "../config";
import { marketplaceABI } from "./MarketplaceABI";

// ✅ Resolve IPFS URLs
const resolveIPFS = (url) => {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return url;
};

const ManageNFT = () => {
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [boughtNFTs, setBoughtNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState("");
  const [withdrawableBalance, setWithdrawableBalance] = useState("0");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  const loadBalance = async (contract) => {
    try {
      const balance = await contract.getMyBalance();
      setWithdrawableBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const loadNFTs = async () => {
    // ✅ Check MetaMask
    if (!window.ethereum) {
      setError("MetaMask not installed. Please install it to manage your NFTs.");
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);

      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const minted = await contract.fetchItemsListed();
      const owned = await contract.fetchMyNFTs();

      // ✅ Fetch metadata for minted NFTs
      const mintedWithMeta = await Promise.all(
        minted.map(async (item) => {
          try {
            const tokenURI = resolveIPFS(await contract.tokenURI(item.tokenId));
            const res = await fetch(tokenURI);
            const meta = await res.json();
            return { ...item, image: resolveIPFS(meta.image), name: meta.name, description: meta.description };
          } catch {
            return item;
          }
        })
      );

      const bought = owned.filter(
        (item) =>
          item.owner.toLowerCase() === address.toLowerCase() &&
          item.seller.toLowerCase() !== address.toLowerCase()
      );

      // ✅ Fetch metadata for bought NFTs
      const boughtWithMeta = await Promise.all(
        bought.map(async (item) => {
          try {
            const tokenURI = resolveIPFS(await contract.tokenURI(item.tokenId));
            const res = await fetch(tokenURI);
            const meta = await res.json();
            return { ...item, image: resolveIPFS(meta.image), name: meta.name, description: meta.description };
          } catch {
            return item;
          }
        })
      );

      setMintedNFTs(mintedWithMeta);
      setBoughtNFTs(boughtWithMeta);
      await loadBalance(contract);
    } catch (err) {
      console.error("Failed to fetch NFTs:", err);
      setError("Failed to load NFTs. Make sure you're connected to Sepolia.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const tx = await contract.withdrawMyFunds();
      await tx.wait();
      await loadNFTs();
    } catch (err) {
      console.error("Withdraw failed:", err);
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  if (loading) return <div className="manage-nft-loading">Loading NFTs...</div>;

  if (error) return (
    <div className="manage-nft-loading" style={{ color: "#f87171" }}>
      {error}
    </div>
  );

  return (
    <div className="manage-nft-container">
      <section className="withdraw-section">
        <h3>Available to Withdraw: {withdrawableBalance} ETH</h3>
        <button
          onClick={handleWithdraw}
          disabled={withdrawing || withdrawableBalance === "0"}
        >
          {withdrawing ? "Withdrawing..." : "Withdraw Funds"}
        </button>
      </section>

      <section className="nft-section">
        <h2>My Minted NFTs</h2>
        {mintedNFTs.length === 0 ? (
          <p>You have not listed any NFTs yet.</p>
        ) : (
          <div className="nft-grid">
            {mintedNFTs.map((item) => (
              <NFTCard
                key={item.tokenId.toString()}
                item={item}
                isOwner={item.owner.toLowerCase() === userAddress.toLowerCase()}
              />
            ))}
          </div>
        )}
      </section>

      <section className="nft-section">
        <h2>Bought NFTs</h2>
        {boughtNFTs.length === 0 ? (
          <p>You haven't bought any NFTs yet.</p>
        ) : (
          <div className="nft-grid">
            {boughtNFTs.map((item) => (
              <NFTCard
                key={item.tokenId.toString()}
                item={item}
                isOwner={item.owner.toLowerCase() === userAddress.toLowerCase()}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageNFT;
