require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

// ✅ Quick check to ensure env vars are loaded
console.log(
  "🔗 PRIMORDIAL_RPC_URL:",
  process.env.PRIMORDIAL_RPC_URL ? "loaded" : "NOT FOUND",
  "| PRIVATE_KEY:",
  process.env.PRIVATE_KEY ? "loaded" : "NOT FOUND"
);

const {
  PRIMORDIAL_RPC_URL,
  PRIVATE_KEY,
  COINMARKETCAP_API_KEY,
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Local Hardhat node
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Primordial BlockDAG Testnet
    primordial: {
      url: PRIMORDIAL_RPC_URL || "https://rpc.primordial.bdagscan.com",
      chainId: 1043,
      // Only add the key if it exists to avoid accidental empty array
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: "BDAG", // shows cost in BDAG gas token
    coinmarketcap: COINMARKETCAP_API_KEY || "",
    // optional: outputFile: "gas-report.txt",
    // optional: noColors: true,
  },
};
