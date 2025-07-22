import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

// Replace with your actual contract address and ABI
import abi from "../NFTmarket/contractABI/NFTMarketplace.json";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not installed");
      return;
    }

    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      const signer = ethProvider.getSigner();
      const userAddress = await signer.getAddress();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

      setProvider(ethProvider);
      setSigner(signer);
      setAddress(userAddress);
      setContract(nftContract);
      toast.success(`Wallet connected: ${userAddress.slice(0, 6)}...`);

    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      toast.error("Failed to connect wallet");
    }
  };

  // Auto-connect on reload if already connected
  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }

    // Listen for account changes
    window.ethereum?.on("accountsChanged", () => {
      connectWallet();
    });

    // Listen for chain/network changes
    window.ethereum?.on("chainChanged", () => {
      window.location.reload();
    });

  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, address, contract, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

// import { createContext, useContext, useEffect, useState } from "react";
// import { ethers } from "ethers";
// import MarketplaceArtifact from "../NFTmarket/contractABI/NFTMarketplace.json";
// import { marketplaceAddress } from "../config";


// const Web3Context = createContext();

// export const Web3Provider = ({ children }) => {
//   const [provider, setProvider] = useState(null);
//   const [signer, setSigner] = useState(null);
//   const [nftContract, setNFTContract] = useState(null);
//   const [marketplaceContract, setMarketplaceContract] = useState(null);

//   useEffect(() => {
//     const init = async () => {
//       if (window.ethereum) {
//         const web3Provider = new ethers.providers.Web3Provider(window.ethereum);


//         const signer = await web3Provider.getSigner();

//        const nft = new ethers.Contract(nftAddress, NFTArtifact.abi, signer);
// const marketplace = new ethers.Contract(marketplaceAddress, MarketplaceArtifact.abi, signer);

//         setProvider(web3Provider);
//         setSigner(signer);
//         setNFTContract(nft);
//         setMarketplaceContract(marketplace);
//       }
//     };

//     init();
//   }, []);

//   return (
//     <Web3Context.Provider value={{ provider, signer, nftContract, marketplaceContract }}>
//       {children}
//     </Web3Context.Provider>
//   );
// };

// export const useWeb3 = () => useContext(Web3Context);
