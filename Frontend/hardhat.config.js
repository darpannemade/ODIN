require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

console.log("✅ SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL ? "loaded" : "NOT FOUND");
console.log("✅ PRIVATE_KEY:", process.env.PRIVATE_KEY ? "loaded" : "NOT FOUND");

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // You can lower runs to 50 or 100 for potentially smaller size
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
  },
};
