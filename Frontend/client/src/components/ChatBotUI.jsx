import React, { useState, useEffect, useContext, useRef } from "react";
import "./ChatBotUI.css";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { ethers } from "ethers";
import contractJson from "../NFTmarket/contractABI/NFTMarketplace.json";
import { AuthContext } from "../context/AuthContext.jsx";
import { handleWalletAction } from "../utils/handleWalletAction.js";
import { useNavigate } from "react-router-dom";
import { MintContext } from "../context/MintContext.jsx";
import odinbg1 from "../assets/bgchatbot.jpg";
import odinIntro from "../assets/odin-intro3.mp4";

export default function ChatBotUI() {
  const [walletAddress, setWalletAddress] = useState("");
  const [prompt, setPrompt] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [exportFormat, setExportFormat] = useState("md");
  const [walletVerified, setWalletVerified] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const { user, authLoading } = useContext(AuthContext);
  const { setNftData } = useContext(MintContext);
  const navigate = useNavigate();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [showExportModal, setShowExportModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [expectingMintData, setExpectingMintData] = useState(false);
  const [mintData, setMintData] = useState({});
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showMintForm, setShowMintForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintInputs, setMintInputs] = useState({ name: "", description: "", price: "" });
  const [mintStep, setMintStep] = useState(0);

  

  useEffect(() => {
    const storedAddress = localStorage.getItem("wallet_address");
    const storedVerified = localStorage.getItem("wallet_verified") === "true";
    if (storedAddress && storedVerified) {
      setWalletAddress(storedAddress);
      setWalletVerified(true);
    } else if (user && !walletAddress && !isConnecting) {
      connectWallet();
    }
  }, [user, authLoading]);

  const logoutWallet = () => {
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("wallet_verified");
    setWalletAddress("");
    setWalletVerified(false);
    alert("👋 Wallet disconnected.");
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    if (authLoading) {
      alert("⏳ Please wait, user session is still loading...");
      setIsConnecting(false);
      return;
    }

    if (!user?.email) {
      alert("🔐 Please log in to link your wallet.");
      setIsConnecting(false);
      return;
    }

    try {
      if (!window.ethereum) {
        alert("🦊 MetaMask not detected.");
        setIsConnecting(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      localStorage.setItem("wallet_address", address);

      const verified = await verifyWalletOwnership(address);
      if (!verified) {
        alert("❌ Wallet signature verification failed.");
        setIsConnecting(false);
        return;
      }

      setIsConnecting(false);
      return address;
    } catch (err) {
      setIsConnecting(false);
      return null;
    }
  };

  const verifyWalletOwnership = async (address) => {
    if (!user?.email || !address) return false;

    const res = await fetch("http://localhost:8000/sign-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, user_email: user.email }),
    });

    const data = await res.json();
    const challenge = data.challenge;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(challenge);

    const verifyRes = await fetch("http://localhost:8000/verify-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, signature, user_email: user.email }),
    });

    const { verified } = await verifyRes.json();
    setWalletVerified(verified);
    if (verified) localStorage.setItem("wallet_verified", "true");
    return verified;
  };


  const toggleWalletConnection = () => {
    if (walletAddress) logoutWallet();
    else connectWallet();
  };

const sendMessage = async () => {
  if (!prompt.trim()) return;


  const sendEthMatch = prompt.toLowerCase().match(/send\s+([\d.]+)\s*eth\s+to\s+(0x[a-f0-9]{40})/i);
if (sendEthMatch) {
  const [, ethAmount, toAddress] = sendEthMatch;
  await handleSendETH(toAddress, ethAmount);
  setPrompt("");
  return;
}



  if (!expectingMintData && prompt.toLowerCase().includes("mint nft")) {
    setBotResponse("🖼️ Let's mint your NFT! Please upload an image.");
    setExpectingMintData(true);
    setTimeout(() => fileInputRef.current?.click(), 500);
    setPrompt("");
    return;
  }

  if (expectingMintData && mintStep === 1) {
    const [name, description, price] = prompt.split(",").map(s => s.trim());
    if (!name || !description || !price) {
      alert("⚠️ Please provide: name, description, price");
      return;
    }
    setMintInputs({ name, description, price });
    setBotResponse("✅ Ready! Type **confirm mint** to proceed or **cancel** to abort.");
    setMintStep(2);
    setPrompt("");
    return;
  }

  if (expectingMintData && mintStep === 2) {
    if (prompt.toLowerCase().includes("confirm")) {
      handleMintConfirm();
      setPrompt("");
      return;
    } else if (prompt.toLowerCase().includes("cancel")) {
      resetMinting();
      setBotResponse("❌ Minting cancelled.");
      setPrompt("");
      return;
    }
  }

  // Regular chat
  setLoading(true);
  setBotResponse("");

  try {
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.uid || walletAddress || "guest",
        prompt,
        wallet_info: {
          eth_balance: "0.0",
          address: walletAddress || "guest",
          user_email: user?.email || "",
        },
      }),
    });

    const data = await res.json();
    const [response] = data.response.split("\n\n💡 ");
    setBotResponse(response);
    setChatHistory((prev) => [...prev, { prompt, response }]);
  } catch {
    setBotResponse("❌ Failed to connect to chatbot.");
  } finally {
    setLoading(false);
  }
};

const handleSendETH = async (to, amount) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
    });

    setBotResponse(`📤 Transaction sent! Hash: ${tx.hash}`);
  } catch (err) {
    console.error("ETH Send failed:", err);
    setBotResponse("❌ Failed to send ETH: " + err.message);
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
  setBotResponse(" Now enter: `Name, Description, Price in ETH`");
  setMintStep(1);
};

const handleMintConfirm = async () => {
  if (!imageFile || !mintInputs.name || !mintInputs.description || !mintInputs.price) {
    alert("❗ All minting fields required");
    return;
  }

  try {
    setLoading(true);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractJson.abi, signer); // ✅

    const mintFee = await contract.getMintingFee();
    const listingFee = await contract.getListingPrice(); // ✅

    const mintPrice = ethers.utils.parseEther(mintInputs.price);
    const totalFee = mintFee.add(listingFee);

    const tx = await contract.createToken(
      "ipfs://dummy-url", // replace later
      mintPrice,
      { value: totalFee }
    );

    await tx.wait();
    setBotResponse("🎉 NFT minted successfully!");
  } catch (err) {
    console.error("Minting failed:", err);
    setBotResponse("❌ Minting failed.");
  } finally {
    resetMinting();
    setLoading(false);
  }
};


const resetMinting = () => {
  setExpectingMintData(false);
  setImageFile(null);
  setImagePreview(null);
  setMintInputs({ name: "", description: "", price: "" });
  setMintStep(0);
};


  const exportChat = (format) => {
    const text = chatHistory
      .map((entry) => `User: ${entry.prompt}\nBot: ${entry.response}\n`)
      .join("\n\n");

    if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text(text, 10, 10);
      doc.save("chat_history.pdf");
    } else {
      const blob = new Blob([text], {
        type: {
          md: "text/markdown",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }[format],
      });
      saveAs(blob, `chat_history.${format}`);
    }
  };


return (
  <>
{showMintForm && (
  <div className="mint-modal">
    <h3>Mint Your NFT</h3>
    <input type="file" onChange={handleImageUpload} />
    {imagePreview && <img src={imagePreview} className="mint-preview" />}
    <input
      placeholder="Name"
      value={mintInputs.name}
      onChange={(e) => setMintInputs({ ...mintInputs, name: e.target.value })}
    />
    <input
      placeholder="Description"
      value={mintInputs.description}
      onChange={(e) => setMintInputs({ ...mintInputs, description: e.target.value })}
    />
    <input
      placeholder="Price in ETH"
      value={mintInputs.price}
      onChange={(e) => setMintInputs({ ...mintInputs, price: e.target.value })}
    />
    <button onClick={handleMintConfirm}>Confirm Mint</button>
    <button onClick={() => setShowMintForm(false)}>Cancel</button>
  </div>
)}


{showIntro && (
  <div className={`intro-video-wrapper ${fadeOut ? "fade-out" : ""}`}>
    <video
      autoPlay
      muted
      playsInline
      className="intro-video"
      onEnded={() => {
        setFadeOut(true);
        setTimeout(() => setShowIntro(false), 1000);
      }}
    >
      <source src={odinIntro} type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <button
      className="skip-intro-btn"
      onClick={() => {
        setFadeOut(true);
        setTimeout(() => setShowIntro(false), 800);
      }}
    >
      Skip Intro
    </button>
  </div>
)}

{!showIntro && (
  <div
    className="chatui-wrapper fade-in"
    style={{
      backgroundImage: `url(${odinbg1})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
    }}
  >
        <div className="chatui-container">
          {/* Left Panel - Sidebar */}
          <div className="chatui-sidebar">
            <div style={{ marginBottom: "20px" }}>
              <button
                className="btn export"
                onClick={toggleWalletConnection}
                style={{
                  width: "100%",
                  marginBottom: "8px",
                  border: `1px solid ${
                    walletAddress ? "#ff4f4f55" : "#28e07b55"
                  }`,
                  backgroundColor: walletAddress
                    ? "rgba(255, 79, 79, 0.07)"
                    : "rgba(40, 224, 123, 0.07)",
                  color: "#fff",
                }}
              >
                {walletAddress ? "Disconnect Wallet" : "Connect Wallet"}
              </button>

              {walletAddress && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: walletVerified ? "#00ffae" : "#ff6b6b",
                    marginBottom: "16px",
                  }}
                >
                  <i
                    className={`fas fa-${
                      walletVerified ? "check-circle" : "times-circle"
                    }`}
                    style={{ fontSize: "1rem" }}
                  ></i>
                  {walletVerified ? "Wallet Verified" : "Wallet Not Verified"}
                </div>
              )}

              <h2 className="chatui-sidebar-title">Suggestions</h2>
              <div className="chatui-chat-list">
                {[
                  "Explain Ethereum in simple terms",
                  "How do NFTs work?",
                  "Create a DAO governance pitch",
                  "Send 0.01 ETH to 0xABC...DEF",
                  "mint nft",
                  "List all NFT's",
                  "My favorite blockchain is Solana",
                  "Remember that my Name is Alex.",
                  "Remember your name is Odin's Eye ",
                  "What is Blockchain?",
                  "What is Defi ?"
                  
                  
                ].map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="chatui-chat-item"
                    title="Click to copy"
                    onClick={() => setPrompt(suggestion)}
                    style={{ cursor: "pointer" }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Area */}
          {walletAddress ? (
            <div className="chatui-chat-panel">
              <div className="chatui-header">
                <h1
                  className="chatui-heading"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#ffffff",
                    fontFamily: '"Modrenize", sans-serif',
                  }}
                >
                  <span>
                    Welcome to{" "}
                    <span
                      style={{
                        color: "#c084fc",
                        fontWeight: 600,
                        textShadow: "0 1px 6px rgba(9, 9, 54, 0.6)",
                      }}
                    >
                      Odin’s Eye
                    </span>{" "}
                    —{" "}
                    <span style={{ color: "white", fontWeight: 500 }}>
                      See Beyond
                    </span>
                    , Ask Anything.
                  </span>
                </h1>
              </div>

              <div className="chatui-output">
                {imagePreview && (
  <div className="chatui-response">
    <strong>Preview:</strong><br />
    <img src={imagePreview} alt="Preview" className="mint-preview" />
  </div>
)}
                {loading && (
                  <div className="chatui-response">⏳ Thinking...</div>
                )}
                {!loading && botResponse && (
                  <div className="chatui-response">
                    <strong>Bot:</strong> {botResponse}
                  </div>
                )}
              </div>

              <div className="chatui-input-area">
                <input
                  type="text"
                  className="chatui-input"
                  placeholder="Type your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="chatui-send-btn" onClick={sendMessage}>
                  ➤
                </button>
              </div>

              <button
                className="btn export"
                onClick={() => setShowExportModal(true)}
              >
                Export Chat
              </button>

              {showExportModal && (
                <div
                  className="chatui-modal-overlay"
                  onClick={() => setShowExportModal(false)}
                >
                  <div
                    className="chatui-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="chatui-modal-title">Export Chat As</h3>
                    <div className="chatui-modal-buttons">
                      <button onClick={() => handleExportFormat("md")}>
                        Markdown (.md)
                      </button>
                      <button onClick={() => handleExportFormat("pdf")}>
                        PDF (.pdf)
                      </button>
                      <button onClick={() => handleExportFormat("docx")}>
                        Word (.docx)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="chatui-chat-panel"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: 500,
              }}
            >
              Connect to MetaMask to continue.
            </div>
            
          )}
          <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  style={{ display: "none" }}
  onChange={handleImageUpload}
/>
        </div>
      </div>

      
    )}
  </>
);

}

/////////////// Working 2 ///////////////////////

// import React, { useState, useEffect } from "react";
// import './ChatBotUI.css';
// import jsPDF from "jspdf";
// import { saveAs } from "file-saver";
// import { ethers } from "ethers";
// import contractJson from "../NFTmarket/contractABI/NFTMarketplace.json";

// export default function ChatBotUI() {
//   const [walletAddress, setWalletAddress] = useState("");
//   const [prompt, setPrompt] = useState("");
//   const [botResponse, setBotResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestion, setSuggestion] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [exportFormat, setExportFormat] = useState("md");

//   const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//   useEffect(() => {
//     connectWallet();
//     testEthers();
//   }, []);

// const connectWallet = async () => {
//   if (window.ethereum) {
//     try {
//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       setWalletAddress(accounts[0]);
//       return accounts[0]; // return for chaining
//     } catch (err) {
//       console.error("❌ Wallet connection failed:", err);
//       return null;
//     }
//   } else {
//     alert("MetaMask is not installed!");
//     return null;
//   }
// };

//   const testEthers = async () => {
//     try {
//       console.log("🧪 Testing ethers...");
//       if (!ethers.providers) {
//         console.error("❌ ethers.providers is undefined!");
//         return;
//       }
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const balance = await signer.getBalance();
//       console.log("✅ Balance fetched in test:", ethers.utils.formatEther(balance));
//     } catch (err) {
//       console.error("❌ Ethers test failed:", err);
//     }
//   };

//   const sendMessage = async () => {
//     if (!prompt.trim()) return;

//     setLoading(true);
//     setBotResponse("");

//     let ethInEther = "0.0";

//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const balance = await signer.getBalance();
//       ethInEther = ethers.utils.formatEther(balance);
//     } catch (err) {
//       console.warn("⚠️ Could not fetch ETH balance.");
//     }

//     try {
//       const walletInfo = {
//         eth_balance: ethInEther,
//         address: walletAddress || "guest"
//       };

//       const res = await fetch("http://localhost:8000/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: walletAddress || "guest",
//           prompt,
//           wallet_info: walletInfo
//         }),
//       });

//       const data = await res.json();
//       console.log("📥 Full response:", data);

//       const [response, followup] = data.response.split("\n\n💡 ");
//       const cleaned = response
//         .split("\n\n")
//         .filter((line, i, arr) => arr.indexOf(line) === i)
//         .join("\n\n");

//       setBotResponse(cleaned);
//       setSuggestion(followup || "");
//       setChatHistory(prev => [...prev, { prompt, response: cleaned }]);

//       if (data.action?.intent) {
//         handleAction(data.action);
//       }

//     } catch (err) {
//       console.error("❌ sendMessage error:", err);
//       setBotResponse("❌ Failed to connect to chatbot.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMyNFTs = async () => {
//   try {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

//     const items = await contract.fetchMyNFTs();

//     if (items.length === 0) {
//       alert("You don’t own any NFTs.");
//       return;
//     }

//     const formatted = await Promise.all(items.map(async (item) => {
//       let tokenURI = "";
//       try {
//         tokenURI = await contract.tokenURI(item.tokenId);
//       } catch {}

//       return {
//         tokenId: item.tokenId.toString(),
//         price: ethers.utils.formatEther(item.price),
//         tokenURI
//       };
//     }));

//     console.log("🎯 Your NFTs:", formatted);
//     alert("✅ Open console to view your NFTs");

//   } catch (err) {
//     console.error("❌ fetchMyNFTs failed:", err);
//     alert("❌ Failed to fetch NFTs:\n" + (err.message || JSON.stringify(err)));
//   }
// };

//   const handleAction = async (action) => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

//       switch (action.intent) {
//         case "transfer_eth":
//           try {
//             const confirmed = window.confirm(`Send ${action.amount} ETH to ${action.to}?`);
//             if (!confirmed) return;

//             const tx = await signer.sendTransaction({
//               to: action.to,
//               value: ethers.utils.parseEther(action.amount.trim())
//             });

//             alert(`✅ ETH sent!\nTx Hash: ${tx.hash}`);
//           } catch (err) {
//             console.error("❌ transfer_eth failed:", err);
//             alert(`❌ ETH transfer failed: ${err.message || err}`);
//           }
//           break;

//         case "buy_nft":
//           try {
//             const tx = await contract.createMarketSale(action.token_id, {
//               value: ethers.utils.parseEther(action.price.trim())
//             });
//             await tx.wait();
//             alert(`✅ NFT #${action.token_id} purchased for ${action.price} ETH`);
//           } catch (err) {
//             console.error("❌ buy_nft failed:", err);
//             alert(`❌ Failed to buy NFT: ${err.message || err}`);
//           }
//           break;

// case "list_nft":
//   try {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

//     let ownsNFT = false;

//     // Step 1: Check if user owns the NFT (optional, catches invalid tokenId too)
//     try {
//       const owner = await contract.ownerOf(action.token_id);
//       ownsNFT = owner.toLowerCase() === walletAddress.toLowerCase();
//     } catch (checkErr) {
//       console.warn("⚠️ Could not check ownerOf token. It might not exist yet.");
//     }

//     // Step 2: If user owns the token → resellToken flow
//     if (ownsNFT) {
//       const approved = await contract.getApproved(action.token_id);
//       if (approved.toLowerCase() !== contractAddress.toLowerCase()) {
//         const approvalTx = await contract.approve(contractAddress, action.token_id);
//         await approvalTx.wait();
//         console.log(`✅ Approved marketplace to transfer NFT #${action.token_id}`);
//       }

//       const listingFee = await contract.getListingPrice();
//       const tx = await contract.resellToken(
//         action.token_id,
//         ethers.utils.parseEther(action.price.trim()),
//         { value: listingFee }
//       );

//       await tx.wait();
//       alert(`✅ NFT #${action.token_id} listed via resellToken`);
//     }

//     // Step 3: Else → Mint + list via createToken
//     else {
//       const totalFee = await contract.getListingPrice();
//       const mintFee = await contract.getMintingFee();
//       const total = mintFee.add(totalFee);

//       const confirmed = window.confirm(
//         `You do not currently own token #${action.token_id}.\n\nWould you like to mint a new NFT and list it for ${action.price} ETH?\n\nTotal fee: ${ethers.utils.formatEther(total)} ETH`
//       );
//       if (!confirmed) return;

//       const tx = await contract.createToken(
//         "ipfs://dummy-uri", // you can replace this dynamically
//         ethers.utils.parseEther(action.price.trim()),
//         { value: total }
//       );
//       await tx.wait();
//       alert(`✅ NFT minted and listed successfully`);
//     }
//   } catch (err) {
//     console.error("❌ list_nft failed:", err);
//     alert("❌ Listing failed:\n" + (err.reason || err.message || JSON.stringify(err)));
//   }
//   break;

//         default:
//           console.warn("⚠️ Unknown intent:", action.intent);
//       }
//     } catch (err) {
//       console.error("❌ handleAction failed:", err);
//       alert("❌ Blockchain action failed.");
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   const exportChat = () => {
//     const text = chatHistory.map(entry =>
//       `User: ${entry.prompt}\nBot: ${entry.response}\n`
//     ).join("\n\n");

//     if (exportFormat === "pdf") {
//       const doc = new jsPDF();
//       doc.setFontSize(12);
//       doc.text(text, 10, 10);
//       doc.save("chat_history.pdf");
//     } else {
//       const blob = new Blob([text], {
//         type: {
//           md: "text/markdown",
//           docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         }[exportFormat]
//       });
//       saveAs(blob, `chat_history.${exportFormat}`);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="main-content">
//         <div className="left-pane">
//           <div className="greeting">
//             <h1>Hey{walletAddress ? `, ${walletAddress.slice(0, 6)}...` : ""}!</h1>
//             <h2>What can I help with?</h2>
//           </div>

//           <div className="button-group">
//             <button className="btn suggestions" onClick={connectWallet}>
//               {walletAddress ? "Wallet Connected" : "Connect Wallet"}
//             </button>

//             <select
//               value={exportFormat}
//               onChange={(e) => setExportFormat(e.target.value)}
//               className="btn export"
//             >
//               <option value="md">Markdown (.md)</option>
//               <option value="pdf">PDF (.pdf)</option>
//               <option value="docx">Word (.docx)</option>
//             </select>

//             <button className="btn export" onClick={exportChat}>
//               Export Chat
//             </button>
//           </div>

//           <button className="btn export" onClick={fetchMyNFTs}>
//               Show My NFTs
//           </button>

//           <div className="chat-output">
//             {loading && <div className="bot-response">⏳ Thinking...</div>}
//             {!loading && botResponse && (
//               <div className="bot-response">
//                 <strong>Bot:</strong> {botResponse.split("\n\n💡")[0]}
//                 {botResponse.includes("💡") && (
//                   <div className="suggestion-tip">💡 {botResponse.split("\n\n💡")[1]}</div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="chat-input-container">
//             <input
//               type="text"
//               placeholder="Ask me anything..."
//               className="chat-input"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button className="send-btn" onClick={sendMessage}>↑</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//////// Not working but the code block below this is working

// import React, { useState, useEffect } from "react";

// import './ChatBotUI.css';
// import jsPDF from "jspdf";
// import { saveAs } from "file-saver";
// import { ethers } from "ethers";
// import { useWeb3 } from "../context/Web3Context";
// import { toast, Toaster } from "react-hot-toast";

// export default function ChatBotUI() {
//   const [prompt, setPrompt] = useState("");
//   const [botResponse, setBotResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   // const [suggestion, setSuggestion] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [exportFormat, setExportFormat] = useState("md");

//  const { signer, address, contract, connectWallet } = useWeb3();

//   // Load history on mount
//   useEffect(() => {
//     const stored = localStorage.getItem("chat_history");
//     if (stored) setChatHistory(JSON.parse(stored));
//   }, []);

//   // Save history on update
//   useEffect(() => {
//     localStorage.setItem("chat_history", JSON.stringify(chatHistory));
//   }, [chatHistory]);

//   useEffect(() => {
//   if (!address) {
//     connectWallet();
//   }
// }, [address]);

// const sendMessage = async () => {
//   if (!prompt.trim()) return;

//   setLoading(true);
//   setBotResponse("");

//   try {
//     const ethBalance = signer ? await signer.getBalance() : 0;
//     const ethInEther = ethers.utils.formatEther(ethBalance);

//     const walletInfo = {
//       eth_balance: ethInEther,
//     };

//     console.log("📤 Sending prompt to backend:", prompt);

//     const res = await fetch("http://localhost:8000/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         user_id: address || "guest",
//         prompt,
//         wallet_info: walletInfo,
//       }),
//     });

//     console.log("📥 Response status:", res.status);

//     const data = await res.json();
//     console.log("📥 Response data:", data);

//     let response = data.response || "";
//     let followup = "";

//     if (response.includes("\n\n💡")) {
//       [response, followup] = response.split("\n\n💡 ");
//     }

//     const cleaned = response
//       .split("\n\n")
//       .filter((line, i, arr) => arr.indexOf(line) === i)
//       .join("\n\n");

//     setBotResponse(cleaned);
//     setChatHistory((prev) => [...prev, { prompt, response: cleaned }]);

//     if (data.action) handleAction(data.action);
//   } catch (error) {
//     setBotResponse("❌ Error: Failed to connect to chatbot.");
//     console.error("❌ sendMessage error:", error);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleAction = async (action) => {
//     if (!signer) return toast.error("Wallet not connected");

//     try {
//       switch (action.intent) {
//         case "transfer_eth":
//           if (!window.confirm(`Send ${action.amount} ETH to ${action.to}?`)) return;
//           const tx1 = await signer.sendTransaction({
//             to: action.to,
//             value: ethers.utils.parseEther(action.amount),
//           });
//           await tx1.wait();
//           toast.success(`✅ Sent ${action.amount} ETH!`);
//           break;

//         case "list_nft":
//           const fee = await contract.getListingPrice();
//           const tx2 = await contract.listNFT(action.token_id, ethers.utils.parseEther(action.price), {
//             value: fee,
//           });
//           await tx2.wait();
//           toast.success(`✅ NFT #${action.token_id} listed!`);
//           break;

//         case "buy_nft":
//           const tx3 = await contract.createMarketSale(action.token_id, {
//             value: ethers.utils.parseEther(action.price),
//           });
//           await tx3.wait();
//           toast.success(`✅ NFT #${action.token_id} purchased!`);
//           break;

//         case "transfer_nft":
//           const tx4 = await contract.safeTransferFrom(address, action.to, action.token_id);
//           await tx4.wait();
//           toast.success(`✅ NFT #${action.token_id} sent to ${action.to}`);
//           break;

//         case "fetch_nfts":
//           const res = await fetch(`http://localhost:8000/wallet-nfts/${address}`);
//           const nfts = await res.json();
//           console.log("📦 NFTs:", nfts);
//           toast.success(`Fetched ${nfts?.length || 0} NFTs`);
//           break;

//         default:
//           toast("⚠️ Unknown action");
//       }
//     } catch (err) {
//       console.error("Action failed:", err);
//       if (err.code === 4001) {
//         toast.error("❌ Transaction rejected by user");
//       } else if (err.message?.toLowerCase().includes("insufficient funds")) {
//         toast.error("⚠️ Insufficient ETH to complete transaction");
//       } else if (err.message?.toLowerCase().includes("execution reverted")) {
//         toast.error("⚠️ Transaction reverted by smart contract");
//       } else {
//         toast.error(`❌ Action failed: ${err.message || "Unknown error"}`);
//       }
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   const exportChat = () => {
//     const text = chatHistory.map(entry => `User: ${entry.prompt}\nBot: ${entry.response}\n`).join("\n\n");

//     if (exportFormat === "md") {
//       const blob = new Blob([text], { type: "text/markdown" });
//       saveAs(blob, "chat_history.md");
//     } else if (exportFormat === "pdf") {
//       const doc = new jsPDF();
//       doc.setFontSize(12);
//       doc.text(text, 10, 10);
//       doc.save("chat_history.pdf");
//     } else if (exportFormat === "docx") {
//       const blob = new Blob([text], {
//         type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       });
//       saveAs(blob, "chat_history.docx");
//     }
//   };

//   const clearChatHistory = () => {
//     setChatHistory([]);
//     localStorage.removeItem("chat_history");
//     toast("🗑 Chat history cleared");
//   };

//   return (
//     <div className="chatbot-container">
//       <Toaster position="top-right" />
//       <div className="main-content">
//         <div className="left-pane">
//           <div className="greeting">
//             <h1>Hey{address ? `, ${address.slice(0, 6)}...` : ""}!</h1>
//             <h2>What can I help with?</h2>
//           </div>

//           <div className="button-group">
//             <button className="btn suggestions" onClick={() => window.location.reload()}>Reload</button>
//             <select
//               value={exportFormat}
//               onChange={(e) => setExportFormat(e.target.value)}
//               className="btn export"
//             >
//               <option value="md">Markdown (.md)</option>
//               <option value="pdf">PDF (.pdf)</option>
//               <option value="docx">Word (.docx)</option>
//             </select>
//             <button className="btn export" onClick={exportChat}>Export Chat</button>
//             <button className="btn export" onClick={clearChatHistory}>Clear Chat</button>
//           </div>

//           <div className="chat-output">
//             {loading && <div className="bot-response">⏳ Thinking...</div>}
//             {!loading && botResponse && (
//               <div className="bot-response">
//                 <strong>Bot:</strong> {botResponse.split("\n\n💡")[0]}
//                 {botResponse.includes("💡") && (
//                   <div className="suggestion-tip">💡 {botResponse.split("\n\n💡")[1]}</div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="chat-input-container">
//             <input
//               type="text"
//               placeholder="Ask me anything..."
//               className="chat-input"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button className="send-btn" onClick={sendMessage}>↑</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

///// Working////

// import React, { useState, useEffect } from "react";
// import './ChatBotUI.css';
// import jsPDF from "jspdf";
// import { saveAs } from "file-saver";

// export default function ChatBotUI() {
//   const [walletAddress, setWalletAddress] = useState("");
//   const [prompt, setPrompt] = useState("");
//   const [botResponse, setBotResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestion, setSuggestion] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [exportFormat, setExportFormat] = useState("md"); // ✅ Export format selector

//   useEffect(() => {
//     connectWallet();
//   }, []);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts"
//         });
//         setWalletAddress(accounts[0]);
//       } catch (err) {
//         console.error("❌ Wallet connection failed:", err);
//       }
//     } else {
//       alert("MetaMask is not installed!");
//     }
//   };

// const sendMessage = async () => {
//   if (!prompt.trim()) return;

//   setLoading(true);
//   setBotResponse("");

//   try {
//     const res = await fetch("http://localhost:8000/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id: walletAddress || "guest", prompt }),
//     });

//     const data = await res.json(); // ✅ Only called once here

//     const [response, followup] = data.response.split("\n\n💡 ");
//     const cleaned = response
//       .split("\n\n")
//       .filter((line, i, arr) => arr.indexOf(line) === i)
//       .join("\n\n");

//     setBotResponse(cleaned);
//     setSuggestion(followup || "");
//     setChatHistory((prev) => [...prev, { prompt, response: cleaned }]);

//     if (data.action) {
//       handleAction(data.action); // ✅ Handles EVM action
//     }

//   } catch (error) {
//     setBotResponse("❌ Error: Failed to connect to chatbot.");
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// };

// const handleAction = async (action) => {
//   if (action.intent === "transfer_eth") {
//     const confirmed = window.confirm(`Send ${action.amount} ETH to ${action.to}?`);
//     if (!confirmed) return;

//     try {
//       const tx = await window.ethereum.request({
//         method: "eth_sendTransaction",
//         params: [{
//           from: walletAddress,
//           to: action.to,
//           value: ethers.utils.parseUnits(action.amount, "ether").toHexString(),
//         }]
//       });
//       alert(`✅ Transfer sent: ${tx}`);
//     } catch (err) {
//       console.error("Transfer failed:", err);
//       alert("❌ Transfer failed");
//     }
//   }

//   if (action.intent === "list_nft") {
//     try {
//       const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
//       const contract = new ethers.Contract(contractAddress, abi, signer);
//       const listingFee = await contract.getListingPrice();
//       const tx = await contract.listNFT(action.token_id, ethers.utils.parseEther(action.price), {
//         value: listingFee
//       });
//       await tx.wait();
//       alert(`✅ NFT #${action.token_id} listed for ${action.price} ETH`);
//     } catch (err) {
//       console.error("Listing failed:", err);
//       alert("❌ Listing failed");
//     }
//   }
// };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   const exportChat = () => {
//     const text = chatHistory.map(entry => `User: ${entry.prompt}\nBot: ${entry.response}\n`).join("\n\n");

//     if (exportFormat === "md") {
//       const blob = new Blob([text], { type: "text/markdown" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "chat_history.md";
//       link.click();
//     } else if (exportFormat === "pdf") {
//       const doc = new jsPDF();
//       doc.setFontSize(12);
//       doc.text(text, 10, 10);
//       doc.save("chat_history.pdf");
//     } else if (exportFormat === "docx") {
//       const blob = new Blob([text], {
//         type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//       });
//       saveAs(blob, "chat_history.docx");
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="main-content">
//         <div className="left-pane">
//           <div className="greeting">
//             <h1>Hey{walletAddress ? `, ${walletAddress.slice(0, 6)}...` : ""}!</h1>
//             <h2>What can I help with?</h2>
//           </div>

//           <div className="button-group">
//             <button className="btn suggestions" onClick={connectWallet}>
//               {walletAddress ? "Wallet Connected" : "Connect Wallet"}
//             </button>

//             <select
//               value={exportFormat}
//               onChange={(e) => setExportFormat(e.target.value)}
//               className="btn export"
//             >
//               <option value="md">Markdown (.md)</option>
//               <option value="pdf">PDF (.pdf)</option>
//               <option value="docx">Word (.docx)</option>
//             </select>

//             <button className="btn export" onClick={exportChat}>
//               Export Chat
//             </button>
//           </div>

//           <div className="chat-output">
//             {loading && <div className="bot-response">⏳ Thinking...</div>}
//             {!loading && botResponse && (
//               <div className="bot-response">
//                 <strong>Bot:</strong> {botResponse.split("\n\n💡")[0]}
//                 {botResponse.includes("💡") && (
//                   <div className="suggestion-tip">
//                     💡 {botResponse.split("\n\n💡")[1]}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="chat-input-container">
//             <input
//               type="text"
//               placeholder="Ask me anything..."
//               className="chat-input"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button className="send-btn" onClick={sendMessage}>
//               ↑
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

/////////////////////////////////////////////////////////////////////

// // ✅ ChatBotUI.jsx (Dynamic Suggestions + Export Support)
// import React, { useState, useEffect } from "react";
// import './ChatBotUI.css';
// import jsPDF from "jspdf";
// import { saveAs } from "file-saver"; // optional

// export default function ChatBotUI() {
//   const [walletAddress, setWalletAddress] = useState("");
//   const [prompt, setPrompt] = useState("");
//   const [botResponse, setBotResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestion, setSuggestion] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);

//   useEffect(() => {
//     connectWallet();
//   }, []);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts"
//         });
//         setWalletAddress(accounts[0]);
//       } catch (err) {
//         console.error("❌ Wallet connection failed:", err);
//       }
//     } else {
//       alert("MetaMask is not installed!");
//     }
//   };

//   const sendMessage = async () => {
//     if (!prompt.trim()) return;
//     setLoading(true);
//     setBotResponse("");

//     try {
//       const res = await fetch("http://localhost:8000/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           user_id: walletAddress || "guest",
//           prompt,
//         }),
//       });
//       const data = await res.json();
//       const [response, followup] = data.response.split("\n\n💡 ");
//       const cleaned = response.split("\n\n").filter((line, i, arr) => arr.indexOf(line) === i).join("\n\n");
//       setBotResponse(cleaned);
//       // setBotResponse(response);
//       setSuggestion(followup || "");
//       setChatHistory(prev => [...prev, { prompt, response }]);
//     } catch (error) {
//       setBotResponse("❌ Error: Failed to connect to chatbot.");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

// const exportChat = () => {
//   const [exportFormat, setExportFormat] = useState("md");
//   const text = chatHistory.map(entry => `User: ${entry.prompt}\nBot: ${entry.response}\n`).join("\n\n");

//   <select
//   value={exportFormat}
//   onChange={(e) => setExportFormat(e.target.value)}
//   className="btn export"
// >
//   <option value="md">Markdown (.md)</option>
//   <option value="pdf">PDF (.pdf)</option>
//   <option value="docx">Word (.docx)</option>
// </select>

//   if (exportFormat === "md") {
//     const blob = new Blob([text], { type: "text/markdown" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "chat_history.md";
//     link.click();
//   } else if (exportFormat === "pdf") {
//     const doc = new jsPDF();
//     doc.setFontSize(12);
//     doc.text(text, 10, 10);
//     doc.save("chat_history.pdf");
//   } else if (exportFormat === "docx") {
//     const blob = new Blob([text], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
//     saveAs(blob, "chat_history.docx");
//   }
// };

//   return (
//     <div className="chatbot-container">
//       <div className="main-content">
//         <div className="left-pane">
//           <div className="greeting">
//             <h1>Hey{walletAddress ? `, ${walletAddress.slice(0, 6)}...` : ""}!</h1>
//             <h2>What can I help with?</h2>
//           </div>

//                   {/* <button
//               className="btn export"
//               onClick={() => {
//                 if (!walletAddress) return;
//                 window.open(`http://localhost:8000/export_chat/${walletAddress}`);
//               }}
//             >
//               📝 Export Chat
//             </button> */}

//           <div className="button-group">
//             <button className="btn suggestions" onClick={connectWallet}>
//               {walletAddress ? "Wallet Connected" : "Connect Wallet"}
//             </button>
//             <button className="btn export" onClick={exportChat}>
//               Export Chat
//             </button>
//           </div>

//           <div className="chat-output">
//             {loading && <div className="bot-response">⏳ Thinking...</div>}
//             {!loading && botResponse && (
//               <div className="bot-response">
//                 <strong>Bot:</strong> {botResponse.split("\n\n💡")[0]}
//                 {botResponse.includes("💡") && (
//                   <div className="suggestion-tip">💡 {botResponse.split("\n\n💡")[1]}</div>
//                 )}
//               </div>
//             )}
//             {!loading && suggestion && (
//               // <div className="suggestion-tip">
//               //   💡 {suggestion}
//               // </div>
//               <div className="bot-response">
//                   <strong>Bot:</strong> {botResponse.split("\n\n💡")[0]}
//                   {botResponse.includes("💡") && (
//               <div className="suggestion-tip">
//                💡 {botResponse.split("\n\n💡")[1]}
//                     </div>
//                   )}
//                 </div>
//             )}
//           </div>

//           <div className="chat-input-container">
//             <input
//               type="text"
//               placeholder="Ask me anything..."
//               className="chat-input"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button className="send-btn" onClick={sendMessage}>
//               ↑
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
