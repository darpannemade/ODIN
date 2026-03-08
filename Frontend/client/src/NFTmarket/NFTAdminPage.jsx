import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { marketplaceAddress } from '../config';
import { marketplaceABI } from './MarketplaceABI';
import './NFTAdminPage.css';

const resolveIPFS = (url) => {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return url;
};

export default function NFTAdminPage() {
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

  const [userAddresses, setUserAddresses] = useState([]);
  const [whitelistStatuses, setWhitelistStatuses] = useState({});
  const [blacklistStatuses, setBlacklistStatuses] = useState({});

  const loadAccessControl = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);

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
    }
  };

  const toggleWhitelist = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const isWhite = whitelistStatuses[address];
      const tid = toast.loading(`${isWhite ? 'Removing' : 'Adding'} whitelist status...`);
      
      const tx = isWhite
        ? await contract.removeFromWhitelist(address)
        : await contract.addToWhitelist(address);

      await tx.wait();
      toast.success(`Address ${isWhite ? 'removed from' : 'added to'} whitelist!`, { id: tid });
      loadAccessControl();
    } catch (err) {
      console.error("Whitelist toggle failed:", err);
      toast.error(err.reason || "Change failed");
    }
  };

  const toggleBlacklist = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      const isBlack = blacklistStatuses[address];
      const tid = toast.loading(`${isBlack ? 'Removing' : 'Adding'} blacklist status...`);

      const tx = isBlack
        ? await contract.removeFromBlacklist(address)
        : await contract.addToBlacklist(address);

      await tx.wait();
      toast.success(`Address ${isBlack ? 'freed' : 'banished'}!`, { id: tid });
      loadAccessControl();
    } catch (err) {
      console.error("Blacklist toggle failed:", err);
      toast.error(err.reason || "Change failed");
    }
  };

  const loadAllItems = async () => {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner().catch(() => null);
      if (!signer) {
        setLoading(false);
        return;
      }
      
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      
      const owner = await contract.owner();
      const isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
      setAdmin(isAdmin);

      const currentMintFee = await contract.getMintingFee();
      const currentListingFee = await contract.getListingPrice();
      const mintFeeEth = ethers.utils.formatEther(currentMintFee);
      const listingFeeEth = ethers.utils.formatEther(currentListingFee);
      
      setMintFee(mintFeeEth);
      setListingFee(listingFeeEth);

      const paused = await contract.paused();
      setIsPaused(paused);

      if (isAdmin) {
        const balance = await contract.getAdminFunds();
        setWithdrawableBalance(ethers.utils.formatEther(balance));
      } else {
        setItems([]);
        setLoading(false);
        return;
      }

      const data = await contract.fetchAllNFTs();
      const formatted = await Promise.all(
        data.map(async (item) => {
          try {
            const tokenURI = resolveIPFS(await contract.tokenURI(item.tokenId));
            const res = await fetch(tokenURI);
            const meta = await res.json();
            const priceEth = ethers.utils.formatEther(item.price);
            
            const finalPrice = (
              parseFloat(priceEth || 0) +
              parseFloat(mintFeeEth || 0) +
              parseFloat(listingFeeEth || 0)
            ).toFixed(4);

            return {
              tokenId: item.tokenId.toString(),
              seller: item.seller,
              price: priceEth,
              sold: item.sold,
              image: resolveIPFS(meta.image),
              name: meta.name,
              description: meta.description,
              finalPrice,
            };
          } catch {
            return null;
          }
        })
      );

      setItems(formatted.filter(Boolean));
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!admin) return toast.error("Unauthorized");
    const tid = toast.loading("Withdrawing treasury funds...");
    try {
      setWithdrawing(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.withdrawAdminFunds();
      await tx.wait();
      toast.success("Treasury withdrawn to owner wallet!", { id: tid });
      loadAllItems();
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "Withdrawal failed", { id: tid });
    } finally {
      setWithdrawing(false);
    }
  };

  const togglePause = async () => {
    const tid = toast.loading(isPaused ? "Unpausing protocol..." : "Freezing protocol...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = isPaused ? await contract.unpauseContract() : await contract.pauseContract();
      await tx.wait();
      toast.success(isPaused ? "Protocol Resumed" : "Protocol Frozen", { id: tid });
      setIsPaused(!isPaused);
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "Contract state toggle failed", { id: tid });
    }
  };

  const unlistNFT = async (tokenId) => {
    if (!admin) return toast.error("Unauthorized");
    const tid = toast.loading("Banishing relic from market...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.cancelListing(tokenId);
      await tx.wait();
      toast.success('Relic banished from current active market.', { id: tid });
      loadAllItems();
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "Failed to remove listing", { id: tid });
    }
  };

  const relistNFT = async (nft) => {
    if (!admin) return toast.error("Unauthorized");
    const tid = toast.loading("Relisting relic into market...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      const tx = await contract.resellToken(
        nft.tokenId,
        ethers.utils.parseEther(nft.price),
        { value: ethers.utils.parseEther(listingFee) }
      );
      await tx.wait();
      toast.success('Relic restored to active market!', { id: tid });
      loadAllItems();
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "Failed to relist", { id: tid });
    }
  };

  const updateFee = async (type) => { // 'mint' or 'list'
    if (!admin) return;
    const isMint = type === 'mint';
    const val = isMint ? newMintFee : newListingFee;
    
    if (!val || isNaN(val)) return toast.error("Enter valid ETH numerical amount");
    
    const tid = toast.loading(`Updating ${type} fee...`);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      
      const tx = isMint 
        ? await contract.updateMintingFee(ethers.utils.parseEther(val))
        : await contract.updateListingPrice(ethers.utils.parseEther(val));
        
      await tx.wait();
      toast.success(`${isMint ? 'Minting' : 'Listing'} fee updated successfully!`, { id: tid });
      
      if(isMint) {
        setMintFee(val);
        setNewMintFee('');
      } else {
        setListingFee(val);
        setNewListingFee('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "Fee update failed", { id: tid });
    }
  };

  useEffect(() => {
    loadAllItems();
    loadAccessControl();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="spinner-border text-aurora w-12 h-12 border-4" />
    </div>
  );

  if (!admin) return (
    <div className="aether-card border-error/30 bg-error/5 text-center py-16">
      <div className="text-error text-4xl mb-4">⛔</div>
      <h2 className="font-display text-2xl text-error mb-2 tracking-widest uppercase">Admin Void</h2>
      <p className="font-mono text-muted text-sm uppercase tracking-widest">
        You do not hold the master access key. Authority denied.
      </p>
    </div>
  );

  return (
    <div className="admin-content-area">
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />
      
      {/* GLOBAL CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Fees */}
        <div className="aether-card">
          <h3 className="font-display text-lg tracking-widest uppercase mb-4 text-violet">Protocol Economics</h3>
          
          <div className="flex flex-col gap-4">
            <div className="fee-row bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-sm uppercase tracking-widest text-muted">Forge Tribute (Mint Fee)</span>
                <span className="font-mono text-primary">{mintFee} ETH</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" step="0.001" 
                  className="bg-black/30 border border-white/10 rounded px-3 py-1 font-mono text-sm w-full"
                  placeholder="New amount..."
                  value={newMintFee} onChange={e => setNewMintFee(e.target.value)} 
                />
                <button className="btn-aether btn-sm flex-shrink-0" onClick={() => updateFee('mint')}>Update</button>
              </div>
            </div>

            <div className="fee-row bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-sm uppercase tracking-widest text-muted">Market Tax (Listing Fee)</span>
                <span className="font-mono text-primary">{listingFee} ETH</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" step="0.001" 
                  className="bg-black/30 border border-white/10 rounded px-3 py-1 font-mono text-sm w-full"
                  placeholder="New amount..."
                  value={newListingFee} onChange={e => setNewListingFee(e.target.value)} 
                />
                <button className="btn-aether btn-sm flex-shrink-0" onClick={() => updateFee('list')}>Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Treasury */}
        <div className="aether-card flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg tracking-widest uppercase mb-4 text-aurora">Protocol Treasury</h3>
            <p className="text-muted text-sm mb-2">Accumulated wealth from forge tributes and market taxes.</p>
            <div className="font-display text-4xl font-bold my-4">
              <span className="text-aurora">Ξ</span> {withdrawableBalance}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button 
              className="btn-aether text-center justify-center font-bold" 
              onClick={handleWithdraw} 
              disabled={withdrawing || withdrawableBalance === "0"}
            >
              {withdrawing ? 'Withdrawing...' : 'Claim Treasury'}
            </button>
            <button 
              className={`font-mono text-sm uppercase tracking-widest font-bold border rounded-md transition-colors ${
                isPaused 
                ? 'bg-success/10 text-success border-success/30 hover:bg-success/20' 
                : 'bg-error/10 text-error border-error/30 hover:bg-error/20'
              }`}
              onClick={togglePause}
            >
              {isPaused ? 'Unfreeze Protocol' : 'Freeze Protocol'}
            </button>
          </div>
        </div>
      </div>

      {/* ACCESS CONTROL */}
      <h3 className="font-display text-xl tracking-widest uppercase mt-12 mb-6">Realm Access Control</h3>
      <div className="aether-card p-0 overflow-hidden mb-12">
        <div className="overflow-x-auto w-full">
          <table className="admin-table w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 font-mono text-xs uppercase tracking-widest text-muted">
                <th className="p-4 border-b border-white/10">Entity Address</th>
                <th className="p-4 border-b border-white/10 text-center">Status</th>
                <th className="p-4 border-b border-white/10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-sm">
              {userAddresses.map((addr) => {
                const isWhite = whitelistStatuses[addr];
                const isBlack = blacklistStatuses[addr];
                
                return (
                  <tr key={addr} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">{addr}</td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <span className={`px-2 py-1 rounded text-xs ${isWhite ? 'bg-success/20 text-success' : 'bg-white/5 text-muted'}`}>WL</span>
                        <span className={`px-2 py-1 rounded text-xs ${isBlack ? 'bg-error/20 text-error' : 'bg-white/5 text-muted'}`}>BL</span>
                      </div>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                       <button
                          className={`px-3 py-1 rounded border transition-colors ${isWhite ? 'border-error/50 text-error hover:bg-error/10' : 'border-success/50 text-success hover:bg-success/10'}`}
                          onClick={() => toggleWhitelist(addr)}
                        >
                          {isWhite ? 'Revoke WL' : 'Grant WL'}
                        </button>
                        <button
                          className={`px-3 py-1 rounded border transition-colors ${isBlack ? 'border-success/50 text-success hover:bg-success/10' : 'border-error/50 text-error hover:bg-error/10'}`}
                          onClick={() => toggleBlacklist(addr)}
                        >
                          {isBlack ? 'Pardon BL' : 'Banish BL'}
                        </button>
                    </td>
                  </tr>
                );
              })}
              {userAddresses.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-muted uppercase tracking-widest">No entities registered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALL NFTs OVERVIEW */}
      <h3 className="font-display text-xl tracking-widest uppercase mb-6 mt-12">All Forged Relics</h3>
      {items.length === 0 ? (
        <div className="aether-card text-center py-12 text-muted font-mono uppercase tracking-widest">
          The void is empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((nft, i) => (
            <div key={i} className="aether-card p-0 overflow-hidden flex flex-col border border-white/5 relative group">
              <div className="h-48 w-full relative bg-black">
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded text-xs uppercase font-mono tracking-widest">
                  {nft.sold ? <span className="text-muted">Dormant</span> : <span className="text-success blink-soft">Active LISTING</span>}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-display font-bold text-lg mb-1 truncate">{nft.name}</h4>
                <div className="font-mono text-xs text-muted truncate mb-4">Minter: {nft.seller}</div>
                
                <div className="bg-black/30 rounded p-2 mb-4 font-mono text-xs text-secondary border border-white/5">
                  <div className="flex justify-between mb-1">
                    <span>Base Value:</span> <span>{nft.price} ETH</span>
                  </div>
                  <div className="flex justify-between text-aurora">
                    <span>Taxed Output:</span> <span>{nft.finalPrice} ETH</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  {!nft.sold ? (
                    <button className="w-full py-2 font-mono text-xs uppercase tracking-widest font-bold rounded border border-error/50 text-error hover:bg-error/10 transition-colors" onClick={() => unlistNFT(nft.tokenId)}>
                      Force Delist
                    </button>
                  ) : (
                    <button className="w-full py-2 font-mono text-xs uppercase tracking-widest font-bold rounded border border-success/50 text-success hover:bg-success/10 transition-colors" onClick={() => relistNFT(nft)}>
                      Force Market Relist
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
