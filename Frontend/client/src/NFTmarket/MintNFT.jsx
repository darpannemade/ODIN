// import React, { useState, useEffect, useContext } from 'react';
// import './MintNFT.css';
// import { marketplaceAddress } from '../config';
// import { marketplaceABI } from './MarketplaceABI';
// import { ethers } from 'ethers';
// import axios from 'axios';
// import foxLogo from '../assets/images/walletpage/fox.png';
// import Loading from '../components/Loading/Loading';
// import { useNavigate } from 'react-router-dom';
// import { MintContext } from '../context/MintContext.jsx';

// function MintNFT() {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [price, setPrice] = useState('');
//   const [mintedNFTs, setMintedNFTs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [walletAddress, setWalletAddress] = useState('');
//   const [connecting, setConnecting] = useState(false);

//   const { nftData, setNftData } = useContext(MintContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (nftData?.image) {
//       setFile(nftData.image);
//       setPreview(URL.createObjectURL(nftData.image));
//     }
//     if (nftData?.name) setName(nftData.name);
//     if (nftData?.description) setDescription(nftData.description);
//     if (nftData?.price) setPrice(nftData.price);
//   }, [nftData]);

//   useEffect(() => {
//     if (typeof window.ethereum !== 'undefined') {
//       window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
//         if (accounts.length > 0) {
//           setWalletConnected(true);
//           setWalletAddress(accounts[0]);
//         }
//       });
//     }
//   }, []);

//   useEffect(() => {
//     console.log("Wallet Connected:", walletConnected);
//   }, [walletConnected]);

//   const handleBackToChat = () => {
//     setNftData({ image: null, name: '', description: '', price: '', fromChatbot: false });
//     navigate('/chat');
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     setPreview(URL.createObjectURL(selectedFile));
//   };

//   const connectWallet = async () => {
//     setConnecting(true);
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const accounts = await provider.send("eth_requestAccounts", []);
//       setWalletConnected(true);
//       setWalletAddress(accounts[0]);
//     } catch (err) {
//       console.error("Wallet connection error:", err);
//     } finally {
//       setConnecting(false);
//     }
//   };

//   const disconnectWallet = () => {
//     setWalletConnected(false);
//     setWalletAddress('');
//   };

//   const uploadToIPFS = async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const resFile = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
//       maxBodyLength: 'Infinity',
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
//         pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
//       },
//     });

//     return `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
//   };

//   const uploadMetadataToIPFS = async (imgUrl) => {
//     const metadata = { name, description, image: imgUrl };

//     const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
//       headers: {
//         pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
//         pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
//       },
//     });

//     return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
//   };

//   const handleMint = async (e) => {
//     e.preventDefault();
//     if (!file || !name || !description || !price) {
//       alert('All fields are required');
//       return;
//     }

//     console.log("Attempting to mint...");
//     console.log("Wallet Address:", walletAddress);
//     console.log("Connected:", walletConnected);
//     console.log("File:", file);
//     console.log("Name:", name, "Price:", price);

//     setLoading(true);
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

//       const isBlacklisted = await contract.isBlacklisted(walletAddress);
//       console.log("isBlacklisted:", isBlacklisted);
//       if (isBlacklisted) {
//         alert("⚠️ You are blacklisted and cannot mint NFTs. Please contact the administrator.");
//         setLoading(false);
//         return;
//       }

//       const imageUrl = await uploadToIPFS(file);
//       const metadataUrl = await uploadMetadataToIPFS(imageUrl);

//       const listingFee = await contract.getListingPrice();
//       const mintingFee = await contract.getMintingFee();
//       const totalFee = listingFee.add(mintingFee);
//       const priceInWei = ethers.utils.parseEther(price);

//       const txn = await contract.createToken(metadataUrl, priceInWei, {
//         value: totalFee,
//       });

//       await txn.wait();

//       setMintedNFTs([{ name, description, image: imageUrl, price }, ...mintedNFTs]);
//       setFile(null);
//       setPreview(null);
//       setName('');
//       setDescription('');
//       setPrice('');

//       if (window.confirm('✅ NFT minted! Do you want to return to the chatbot?')) {
//         handleBackToChat();
//       }
//     } catch (error) {
//       console.error('Minting failed:', error);
//       alert('Minting failed. Check console for details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mintnft-container">
//       {(connecting || loading) && <div className="loading-overlay"><Loading /></div>}
//       <div className={`main-content ${connecting || loading ? 'disabled' : ''}`}>
//         {!walletConnected ? (
//           <>
//             <h2 className="page-title">Forge A New Relic</h2>
//             {!connecting && (
//               <>
//                 <button onClick={connectWallet} className="connect-btn">Summon Wallet</button>
//                 <p className="connect-prompt">Summon your powers to forge digital Relics</p>
//               </>
//             )}
//           </>
//         ) : (
//           <>
//             <div className="wallet-bar">
//               <span>Linked Rune: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
//               <button onClick={disconnectWallet} className="disconnect-btn" disabled={connecting}>Break Rune</button>
//             </div>

//             {nftData.fromChatbot && <button className="back-to-chat-btn" onClick={handleBackToChat}>🔙 Back to Chat</button>}

//             <h2 className="page-title">Forge A New Relic</h2>
//             <form onSubmit={handleMint} className="mintnft-form">
//               <label>
//                 Relic Image:
//                 <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading || connecting} />
//               </label>
//               {preview && <img src={preview} alt="Preview" className="preview-img" />}
//               <label>
//                 Relic Name:
//                 <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading || connecting} />
//               </label>
//               <label>
//                 Lore:
//                 <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading || connecting} />
//               </label>
//               <label>
//                 Tribute (in ETH):
//                 <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} disabled={loading || connecting} />
//               </label>
//               <button type="submit" disabled={loading || connecting}>
//                 {loading ? 'Minting...' : 'Mint NFT'}
//               </button>
//             </form>

//             <h3 className="minted-title">Forged Relics</h3>
//             <div className="minted-list">
//               {mintedNFTs.map((nft, idx) => (
//                 <div className="nft-card" key={idx}>
//                   <img src={nft.image} alt={nft.name} />
//                   <h4 className='nftname'>{nft.name}</h4>
//                   <p>{nft.description}</p>
//                   <span>{nft.price} ETH</span>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MintNFT;

////////////////////////////



import React, { useState, useEffect } from 'react';
import './MintNFT.css';
import { marketplaceAddress } from '../config';
import { marketplaceABI } from './MarketplaceABI';
import { ethers } from 'ethers';
import axios from 'axios';
import foxLogo from '../assets/images/walletpage/fox.png';
import Loading from '../components/Loading/Loading';

function MintNFT() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const connectWallet = async () => {
    setConnecting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setTimeout(() => {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        setConnecting(false);
      }, 2000);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnecting(true);
    setTimeout(() => {
      setWalletConnected(false);
      setWalletAddress('');
      setConnecting(false);
    }, 2000);
  };

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

  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const resFile = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': `multipart/form-data`,
        pinata_api_key: "22257690d2eb4e3adb46",
        pinata_secret_api_key: "ccc5675ed7c389bcbeb154569416a98bfc522a13619c089a309aa5f80b75bc9c",
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
  };

  const uploadMetadataToIPFS = async (imgUrl) => {
    const metadata = {
      name,
      description,
      image: imgUrl,
    };

    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
      headers: {
        pinata_api_key: "22257690d2eb4e3adb46",
        pinata_secret_api_key: "ccc5675ed7c389bcbeb154569416a98bfc522a13619c089a309aa5f80b75bc9c",
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

 const handleMint = async (e) => {
  e.preventDefault();

  if (!file || !name || !description || !price) {
    alert("All fields are required");
    return;
  }

  setLoading(true);

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
    const userAddress = await signer.getAddress();

    // 🔒 Check if blacklisted before minting
    const isBlacklisted = await contract.isBlacklisted(userAddress);
    if (isBlacklisted) {
      alert("⚠️ You are blacklisted and cannot mint NFTs. Please contact the administrator.");
      setLoading(false);
      return;
    }

    const imageUrl = await uploadToIPFS(file);
    const metadataUrl = await uploadMetadataToIPFS(imageUrl);

    const listingFee = await contract.getListingPrice();
    const mintingFee = await contract.getMintingFee();
    const totalFee = listingFee.add(mintingFee);
    const priceInWei = ethers.utils.parseEther(price);

    const txn = await contract.createToken(metadataUrl, priceInWei, {
      value: totalFee,
    });

    await txn.wait();

    setMintedNFTs([{ name, description, image: imageUrl, price }, ...mintedNFTs]);

    setFile(null);
    setPreview(null);
    setName('');
    setDescription('');
    setPrice('');
  } catch (error) {
    console.error("Minting failed:", error);
    alert("Minting failed. Check console for details.");
  } finally {
    setLoading(false);
  }
};


  if (typeof window.ethereum === 'undefined') {
    return (
      <div className="metamask-install-wrapper">
        <div className="metamask-install-container">
          <h1 className="metamask-install-title">To Create<br />NFT's</h1>
          <div className="metamask-install-card glass-card">
            <div className="glass-filter"></div>
            <div className="glass-distortion-overlay"></div>
            <div className="glass-overlay"></div>
            <div className="glass-specular"></div>

            <div className="glass-content metamask-install-left">
              <p className="metamask-install-text">To continue, please install the MetaMask extension.</p>
              <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                <button className="metamask-install-btn">Get MetaMask</button>
              </a>
            </div>

            <div className="glass-content metamask-install-right">
              <img src={foxLogo} alt="MetaMask Fox" className="fox-svg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mintnft-container">
      {(connecting || loading) && (
        <div className="loading-overlay">
          <Loading />
        </div>
      )}

      <div className={`main-content ${connecting || loading ? 'disabled' : ''}`}>
        {!walletConnected ? (
          <>
            <h2 className="page-title">Forge A New Relic</h2>
            {!connecting ? (
              <>
                <button onClick={connectWallet} className="connect-btn">Summon Wallet</button>
                <p className="connect-prompt">Summon your powers to forge digital Relics</p>
              </>
            ) : null}
          </>
        ) : (
          <>
            <div className="wallet-bar">
              <span>Linked Rune: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              <button onClick={disconnectWallet} className="disconnect-btn" disabled={connecting}>
                Break Rune
              </button>
            </div>

            <h2 className="page-title">Forge A New Relic</h2>
            <form onSubmit={handleMint} className="mintnft-form">
              <label>
                Relic Image:
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading || connecting} />
              </label>
              {preview && <img src={preview} alt="Preview" className="preview-img" />}
              <label>
                Relic Name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading || connecting} />
              </label>
              <label>
                Lore:
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading || connecting} />
              </label>
              <label>
                Tribute (in ETH):
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading || connecting}
                />
              </label>
              <button type="submit" disabled={loading || connecting}>
                {loading ? 'Minting...' : 'Mint NFT'}
              </button>
            </form>

            <h3 className="minted-title">Forged Relics</h3>
            <div className="minted-list">
              {mintedNFTs.map((nft, idx) => (
                <div className="nft-card" key={idx}>
                  <img src={nft.image} alt={nft.name} />
                  <h4 className='nftname'>{nft.name}</h4>
                  <p>{nft.description}</p>
                  <span>{nft.price} ETH</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MintNFT;
