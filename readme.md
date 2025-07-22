# 🧠 ODIN — AI-Powered NFT Marketplace (BlockDAG Hackathon)

A full-stack NFT marketplace dApp that embeds an AI-powered chatbot capable of understanding crypto and executing blockchain actions like minting, buying, and transferring NFTs — deployed on the **BlockDAG Testnet**.

---

## 🚀 Features

- Converses naturally about crypto, DeFi, L2s, zk, NFTs, etc.
- Executes smart contract actions via wallet signature:
  - Mint, buy, list, transfer NFT
  - Transfer ETH
- Retrieval-Augmented Generation (RAG) from local trusted sources
- Sentiment-aware, contextually persistent memory
- Signature-verified chat access
- Powered by OpenRouter LLaMA models or local GGUF models
- Learns user name, location, wallet, preferences


### 🖼️ NFT Marketplace
- Buy/sell/mint NFTs via smart contract
- Admin controls: pause/unpause, withdraw, unlist
- Live crypto data from CoinGecko
- Embedded chatbot on every page
- Charts via TradingView
- Coin-specific sections (BTC, ETH, XRP, etc.)
- Wallet login via MetaMask
- EVM-compatible + BlockDAG ready

---

## ⚙ Backend Setup (FastAPI + AI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your OpenRouter key
uvicorn main_app:app --reload
Runs on: http://localhost:8000



🌐 Frontend Setup (React + ethers.js)
bash
Copy
Edit
cd frontend
npm install
cp .env.example .env  # Add your PRIVATE_KEY if needed
npm run dev
Runs on: http://localhost:5173




📂 Update Environment Files
Backend .env

USE_REMOTE_MODEL=True
REMOTE_API_KEY=your-openrouter-api-key
REMOTE_API_BASE=https://openrouter.ai/api/v1
REMOTE_GENERAL_MODEL=meta-llama/llama-3.2-3b-instruct
REMOTE_DEFI_MODEL=meta-llama/llama-3.2-3b-instruct
REMOTE_BITCOIN_MODEL=meta-llama/llama-3.3-70b-instruct


Frontend .env

PRIVATE_KEY=your-wallet-private-key  # optional if backend signs
PRIMORDIAL_RPC_URL=https://rpc.primordial.bdagscan.com
📜 Contract Deployment (BlockDAG Primordial Testnet)


Deploy Smart Contract with Hardhat

npx hardhat run scripts/deploy.js --network primordial


Update these files:
frontend/src/config.js: your deployed contract address

MarketplaceABI.js: full ABI from artifacts/

.env: confirm PRIMORDIAL_RPC_URL and PRIVATE_KEY



🌍 Add BlockDAG to MetaMask (Testnet Setup)
Ask testers to run the following to connect to the BlockDAG testnet:

js
Copy
Edit
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x413',
    chainName: 'BlockDAG Testnet',
    rpcUrls: ['https://rpc.primordial.bdagscan.com'],
    nativeCurrency: {
      name: 'BlockDAG',
      symbol: 'BDAG',
      decimals: 18,
    },
    blockExplorerUrls: ['https://bdagscan.com'],
  }],
});
🧪 How to Test the App
🖥️ Open the App
Go to http://localhost:5173

🔌 Connect MetaMask to BlockDAG Testnet

Follow MetaMask setup above

Ensure your wallet has BDAG tokens (faucet if available)




💬 Use Chatbot with These Commands:
text
Copy
Edit
"Buy NFT #3"
"List my NFT for 0.5 ETH"
"Transfer NFT #2 to 0x123..."
"What is zk-SNARK?"


✅ Chatbot will respond intelligently
✅ All actions go through intent handler → wallet router → smart contract
✅ MetaMask signs transactions
✅ You can mint NFTs from /mint
✅ Visit admin panel at /admin to manage contract



🔐 Admin Dashboard
Navigate to:

http://localhost:5173/admin
Pause/unpause contract

Unlist NFTs

Withdraw balance

View minting history



🧠 Technologies Used
Layer	Stack
Frontend	React, Vite, ethers.js
Backend	FastAPI, Web3.py, LangChain
AI	OpenRouter, LLaMA-3.2/3.3
Blockchain	Solidity, Hardhat, BDAG
Storage	Pinata (IPFS)
Tools	MetaMask, CoinGecko API



📜 License
MIT — feel free to fork, build, and improve!



🧠 Authors
BlockDAG Hackathon 2025
Project: ODIN - AI NFT Marketplace
Authors - darpannemade, ItzVirAj , prathameshc09 , Anster133Q
