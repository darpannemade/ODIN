import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

// Replace with your actual contract address and ABI
import abi from "../NFTmarket/contractABI/NFTMarketplace.json";
const CONTRACT_ADDRESS = "0x993Ec779f00D473dB2AA322acFE2Bc650b06c722";
const SUPPORTED_CHAIN_ID = 11155111;
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

    // ✅ Check network
    const network = await ethProvider.getNetwork();
    if (network.chainId !== SUPPORTED_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch (err) {
        toast.error("Please switch to Sepolia network in MetaMask");
        return;
      }
    }

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

  // Listen for account changes — clear state when user disconnects/switches
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        // User disconnected wallet
        setProvider(null);
        setSigner(null);
        setAddress("");
        setContract(null);
      }
      // Do NOT auto-reconnect — user must click Connect Wallet
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
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
