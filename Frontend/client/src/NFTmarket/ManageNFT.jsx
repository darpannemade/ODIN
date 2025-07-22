import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTCard from "./NFTCard";
import "./ManageNFT.css";
import { marketplaceAddress } from "../config";
import { marketplaceABI } from "./MarketplaceABI";

const ManageNFT = () => {
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [boughtNFTs, setBoughtNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState("");
  const [withdrawableBalance, setWithdrawableBalance] = useState("0");
  const [withdrawing, setWithdrawing] = useState(false);

  const loadBalance = async (contract, address) => {
    try {
      const balance = await contract.getMyBalance();
      setWithdrawableBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const loadNFTs = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);

      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      // Fetch NFTs
      const minted = await contract.fetchItemsListed();
      const owned = await contract.fetchMyNFTs();

      // Filter bought NFTs where current owner is the user and seller is not the user
      const bought = owned.filter(
        (item) =>
          item.owner.toLowerCase() === address.toLowerCase() &&
          item.seller.toLowerCase() !== address.toLowerCase()
      );

      setMintedNFTs(minted);
      setBoughtNFTs(bought);

      // Load user balance
      await loadBalance(contract, address);
    } catch (err) {
      console.error("Failed to fetch NFTs:", err);
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

      await loadNFTs(); // Refresh after withdrawal
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
