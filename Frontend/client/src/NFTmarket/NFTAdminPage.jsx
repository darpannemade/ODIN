import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { marketplaceAddress } from '../config';
import { marketplaceABI } from './MarketplaceABI';
import Loading from '../components/Loading/Loading';
import './NFTAdminPage.css';
import Alert from '../components/Alert';

function NFTAdminPage() {
  const [items, setItems] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const [mintFee, setMintFee] = useState('');
  const [newMintFee, setNewMintFee] = useState('');
  const [listingFee, setListingFee] = useState('');
  const [newListingFee, setNewListingFee] = useState('');

  const [withdrawableBalance, setWithdrawableBalance] = useState("0");
  const [withdrawing, setWithdrawing] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const [userAddresses, setUserAddresses] = useState([]);
  const [whitelistStatuses, setWhitelistStatuses] = useState({});
  const [blacklistStatuses, setBlacklistStatuses] = useState({});

  const triggerAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 4000);
  };

  const loadAccessControl = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const addresses = await contract.getAllUsers();
      const whitelist = {};
      const blacklist = {};

      for (const addr of addresses) {
        whitelist[addr] = await contract.isWhitelisted(addr);
        blacklist[addr] = await contract.isBlacklisted(addr);
      }

      setUserAddresses(addresses);
      setWhitelistStatuses(whitelist);
      setBlacklistStatuses(blacklist);
    } catch (err) {
      console.error("Access Control load failed:", err);
      triggerAlert("Failed to load access control data.", "error");
    }
  };

  const toggleWhitelist = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const isCurrentlyWhitelisted = whitelistStatuses[address];
      const tx = isCurrentlyWhitelisted
        ? await contract.removeFromWhitelist(address)
        : await contract.addToWhitelist(address);

      await tx.wait();
      triggerAlert(`Address ${isCurrentlyWhitelisted ? 'removed from whitelist' : 'added to whitelist'} successfully!`);
      loadAccessControl();
    } catch (err) {
      console.error("Whitelist toggle failed:", err);
      triggerAlert("Failed to change whitelist status.", "error");
    }
  };

  const toggleBlacklist = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const isCurrentlyBlacklisted = blacklistStatuses[address];
      const tx = isCurrentlyBlacklisted
        ? await contract.removeFromBlacklist(address)
        : await contract.addToBlacklist(address);

      await tx.wait();
      triggerAlert(`Address ${isCurrentlyBlacklisted ? 'removed from blacklist' : 'added to blacklist'} successfully!`);
      loadAccessControl();
    } catch (err) {
      console.error("Blacklist toggle failed:", err);
      triggerAlert("Failed to change blacklist status.", "error");
    }
  };

  const loadAllItems = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const contractWithProvider = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
      const owner = await contractWithProvider.owner();
      const isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
      setAdmin(isAdmin);

      const currentMintFee = await contractWithProvider.getMintingFee();
      const currentListingFee = await contractWithProvider.getListingPrice();
      const mintFeeEth = ethers.utils.formatEther(currentMintFee);
      const listingFeeEth = ethers.utils.formatEther(currentListingFee);
      setMintFee(mintFeeEth);
      setListingFee(listingFeeEth);

      const paused = await contractWithProvider.paused();
      setIsPaused(paused);

      if (isAdmin) {
        const balance = await contractWithProvider.getAdminFunds();
        setWithdrawableBalance(ethers.utils.formatEther(balance));
      }

      if (!isAdmin) {
        setItems([]);
        setLoading(false);
        return;
      }

      const contractWithSigner = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const data = await contractWithSigner.fetchAllNFTs();

      const formatted = await Promise.all(
        data.map(async (item) => {
          const tokenURI = await contractWithSigner.tokenURI(item.tokenId);
          const res = await fetch(tokenURI);
          const meta = await res.json();
          const priceEth = ethers.utils.formatEther(item.price);
          const finalPrice = (
            parseFloat(priceEth || 0) +
            parseFloat(mintFeeEth || 0) +
            parseFloat(listingFeeEth || 0)
          ).toFixed(4);

          return {
            tokenId: item.tokenId.toNumber(),
            seller: item.seller,
            price: priceEth,
            sold: item.sold,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            finalPrice,
          };
        })
      );

      setItems(formatted);
    } catch (err) {
      console.error("Error loading admin data:", err);
      triggerAlert("Failed to load admin data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!admin) return triggerAlert("Unauthorized", "error");
    try {
      setWithdrawing(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.withdrawAdminFunds();
      await tx.wait();
      triggerAlert("Funds withdrawn successfully!");
      loadAllItems();
    } catch (err) {
      console.error("Withdraw failed:", err);
      triggerAlert("Failed to withdraw funds.", "error");
    } finally {
      setWithdrawing(false);
    }
  };

  const togglePause = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = isPaused ? await contract.unpauseContract() : await contract.pauseContract();
      await tx.wait();
      triggerAlert(isPaused ? "Contract unpaused." : "Contract paused.");
      setIsPaused(!isPaused);
    } catch (err) {
      console.error("Toggle pause failed:", err);
      triggerAlert("Failed to toggle contract state.", "error");
    }
  };

  const unlistNFT = async (tokenId) => {
    if (!admin) return triggerAlert("Unauthorized", "error");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.cancelListing(tokenId);
      await tx.wait();
      triggerAlert('NFT unlisted successfully');
      loadAllItems();
    } catch (err) {
      console.error("Unlist failed:", err);
      triggerAlert("Unlist failed.", "error");
    }
  };

  const relistNFT = async (nft) => {
    if (!admin) return triggerAlert("Unauthorized", "error");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.resellToken(
        nft.tokenId,
        ethers.utils.parseEther(nft.price),
        { value: ethers.utils.parseEther(listingFee) }
      );
      await tx.wait();
      triggerAlert('NFT relisted successfully');
      loadAllItems();
    } catch (err) {
      console.error("Relist failed:", err);
      triggerAlert("Relist failed.", "error");
    }
  };

  const updateMintFee = async () => {
    if (!admin) return triggerAlert("Unauthorized", "error");
    if (!newMintFee || isNaN(newMintFee)) return triggerAlert("Enter valid ETH amount", "error");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.updateMintingFee(ethers.utils.parseEther(newMintFee));
      await tx.wait();
      triggerAlert('Minting fee updated!');
      setMintFee(newMintFee);
      setNewMintFee('');
    } catch (err) {
      console.error("Update mint fee failed:", err);
      triggerAlert("Failed to update mint fee.", "error");
    }
  };

  const updateListingFee = async () => {
    if (!admin) return triggerAlert("Unauthorized", "error");
    if (!newListingFee || isNaN(newListingFee)) return triggerAlert("Enter valid ETH amount", "error");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.updateListingPrice(ethers.utils.parseEther(newListingFee));
      await tx.wait();
      triggerAlert('Listing fee updated!');
      setListingFee(newListingFee);
      setNewListingFee('');
    } catch (err) {
      console.error("Update listing fee failed:", err);
      triggerAlert("Failed to update listing fee.", "error");
    }
  };

  useEffect(() => {
    loadAllItems();
    loadAccessControl();
  }, []);

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      {admin && (
        <>
          <div className="admin-settings">
            <div className="admin-fee-section">
              <label>Current Minting Fee: {mintFee} ETH</label>
              <input value={newMintFee} onChange={(e) => setNewMintFee(e.target.value)} placeholder="New mint fee in ETH" />
              <button onClick={updateMintFee}>Update Mint Fee</button>
            </div>

            <div className="admin-fee-section">
              <label>Current Listing Fee: {listingFee} ETH</label>
              <input value={newListingFee} onChange={(e) => setNewListingFee(e.target.value)} placeholder="New listing fee in ETH" />
              <button onClick={updateListingFee}>Update Listing Fee</button>
            </div>
          </div>

          <div className="admin-withdraw-section">
            <h4>Available to Withdraw: {withdrawableBalance} ETH</h4>
            <div className="admin-button-group">
              <button onClick={handleWithdraw} disabled={withdrawing || withdrawableBalance === "0"}>
                {withdrawing ? "Withdrawing..." : "Withdraw Funds"}
              </button>
              <button className={isPaused ? "btn-unpause" : "btn-pause"} onClick={togglePause}>
                {isPaused ? "Unpause Contract" : "Pause Contract"}
              </button>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="admin-grid">
          {items.map((nft, i) => (
            <div key={i} className="admin-card">
              <img src={nft.image} alt={nft.name} />
              <h4>{nft.name}</h4>
              <p>{nft.description}</p>
              <p><strong>Price:</strong> {nft.price} ETH</p>
              <p><strong>Final Price:</strong> {nft.finalPrice} ETH</p>
              <p><strong>Seller:</strong> {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</p>
              <p><strong>Status:</strong> {nft.sold ? 'Unlisted' : 'Listed'}</p>
              {admin && (
                <div className="admin-actions">
                  {!nft.sold ? (
                    <button className="btn-red" onClick={() => unlistNFT(nft.tokenId)}>Unlist</button>
                  ) : (
                    <button className="btn-green" onClick={() => relistNFT(nft)}>List Again</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {admin && (
        <div className="access-control">
          <h3>Access Control</h3>
          <table className="access-table">
            <thead>
              <tr>
                <th>Wallet Address</th>
                <th>Whitelisted</th>
                <th>Blacklisted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userAddresses.map((addr) => (
                <tr key={addr}>
                  <td>{addr}</td>
                  <td>{whitelistStatuses[addr] ? 'Yes' : 'No'}</td>
                  <td>{blacklistStatuses[addr] ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      className={whitelistStatuses[addr] ? 'btn-red' : 'btn-green'}
                      onClick={() => toggleWhitelist(addr)}
                    >
                      {whitelistStatuses[addr] ? 'Remove Whitelist' : 'Add Whitelist'}
                    </button>
                    <button
                      className={blacklistStatuses[addr] ? 'btn-red' : 'btn-green'}
                      onClick={() => toggleBlacklist(addr)}
                    >
                      {blacklistStatuses[addr] ? 'Remove Blacklist' : 'Add Blacklist'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Alert message={alertMessage} type={alertType} visible={alertVisible} />
    </div>
  );
}

export default NFTAdminPage;
