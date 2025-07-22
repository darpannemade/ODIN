import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { marketplaceAddress } from "../config";
import { marketplaceABI } from "./MarketplaceABI";

const NFTCard = ({ item }) => {
  const [newPrice, setNewPrice] = useState("");
  const [image, setImage] = useState("");
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListed, setIsListed] = useState(false);

  useEffect(() => {
    if (!item.tokenId) return;

    const fetchMetadataAndOwnership = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const contract = new ethers.Contract(
          marketplaceAddress,
          marketplaceABI,
          provider
        );

        // Load token URI and fetch metadata
        const tokenURI = await contract.tokenURI(item.tokenId);
        const response = await fetch(tokenURI);
        const metadata = await response.json();

        let imageUrl = metadata.image;
        if (imageUrl.startsWith("ipfs://")) {
          imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        setImage(imageUrl);
        setMetadataLoaded(true);

        // Ownership (seller) check using getMarketItem
        const marketItemData = await contract.getMarketItem(item.tokenId);
        const seller = marketItemData[1]; // seller
        const owner = marketItemData[2];  // owner
        const sold = marketItemData[4];   // sold flag

        setIsSeller(seller.toLowerCase() === userAddress.toLowerCase());

        // NFT is listed if owner is marketplace address and not sold
        setIsListed(owner.toLowerCase() === marketplaceAddress.toLowerCase() && !sold);
      } catch (err) {
        console.error("Error fetching metadata or checking ownership:", err);
        setMetadataLoaded(true);
        setIsSeller(false);
        setIsListed(false);
      }
    };

    fetchMetadataAndOwnership();
  }, [item.tokenId]);

  const handleUnlist = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        marketplaceAddress,
        marketplaceABI,
        signer
      );

      const tx = await contract.cancelListing(item.tokenId);
      await tx.wait();

      alert("NFT unlisted successfully.");
      setIsListed(false);  // NFT is no longer listed
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Unlist failed:", err);
      alert("Failed to unlist NFT.");
    }
  };

  const handleList = async () => {
    try {
      if (!newPrice || isNaN(newPrice)) {
        alert("Please enter a valid price in ETH.");
        return;
      }

      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const priceInWei = ethers.utils.parseEther(newPrice);

      const listingFee = await contract.getListingPrice();
      const tx = await contract.resellToken(item.tokenId, priceInWei, {
        value: listingFee,
      });
      await tx.wait();

      alert("NFT listed successfully!");
      setNewPrice("");
      setIsListed(true); // NFT is now listed
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Listing failed:", err);
      alert("Failed to list NFT.");
    }
  };

  const handleChangePrice = async () => {
    try {
      if (!newPrice || isNaN(newPrice)) {
        alert("Please enter a valid price in ETH.");
        return;
      }

      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const priceInWei = ethers.utils.parseEther(newPrice);

      const tx = await contract.updatePrice(item.tokenId, priceInWei);
      await tx.wait();

      alert("Price updated successfully!");
      setNewPrice("");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to update price:", err);
      alert("Price update failed.");
    }
  };

  return (
    <div className="nft-card">
      {metadataLoaded ? (
        image ? (
          <img src={image} alt={`NFT ${item.tokenId}`} className="nft-image" />
        ) : (
          <p>No image found</p>
        )
      ) : (
        <p>Loading image...</p>
      )}

      <div className="nft-details">
        <p>ID: #{item.tokenId.toString()}</p>
        <p>Price: {ethers.utils.formatEther(item.price)} ETH</p>

        {isSeller && (
          <div className="nft-actions">
            <input
              type="text"
              placeholder="New price (ETH)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="nft-input"
              disabled={loading}
            />

            {isListed ? (
              <>
                <button onClick={handleChangePrice} className="nft-btn" disabled={loading}>
                  {loading ? "Processing..." : "Update Price"}
                </button>
                <button onClick={handleUnlist} className="nft-btn nft-unlist" disabled={loading}>
                  {loading ? "Processing..." : "Unlist"}
                </button>
              </>
            ) : (
              <button onClick={handleList} className="nft-btn" disabled={loading || !newPrice}>
                {loading ? "Processing..." : "List"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
