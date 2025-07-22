import React, { useState } from "react";

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MarketUpdate from "./components/MarketUpdate";
import WalletPage from "./components/WalletPage";
import ChooseSection from "./components/ChooseSection";
import Register from "./auth/Register";
import Login from "./auth/Login";
import UserProfilePage from "./User/UserProfilePage";

// Coins
import BitcoinPage from "./coinpages/bitcoin";
import EthereumPage from "./coinpages/ethereum";
import XRP from "./coinpages/xrp";
import Tether from "./coinpages/tether";
import BNB from "./coinpages/bnb";
import Solana from "./coinpages/solana";
import USDC from "./coinpages/usdc";
import Dogecoin from "./coinpages/dogecoin";
import StETH from "./coinpages/steth";
import Tron from "./coinpages/tron";

// Placeholder for unavailable coins
import ComingSoon from "./coinpages/ComingSoon";
//nft
import MintNFT from "./NFTmarket/MintNFT";
import Marketplace from "./NFTmarket/Marketplace";
import NFTAdminPage from "./NFTmarket/NFTAdminPage"; // ✅ Must be exact
import NFThome from "./NFTmarket/NFThome";
import LandingPage from "./NFTmarket/LandingPage";
import FullMarketUI from "./NFTmarket/FullMarketUI";
import ManageNFT from "./NFTmarket/ManageNFT";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./components/AdminDashboard";
import ChatBotUI from "./components/ChatBotUI";
function App() {
  const [walletAddress, setWalletAddress] = useState(""); // ✅ Wallet state here
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Routes>
          {/* PAGE ROUTES */}
          <Route path="/" element={<Hero />} />
          <Route path="/market" element={<MarketUpdate />} />
          <Route path="/choose" element={<ChooseSection />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected user routes */}

          <Route element={<ProtectedRoute />}>
            <Route path="/marketplace" element={<FullMarketUI />} />
            <Route path="/marketplace1" element={<Marketplace />} />
            <Route path="/bifrost1" element={<NFThome />} />
            <Route path="/bifrost" element={<LandingPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/manageNFT" element={<ManageNFT />} />

            <Route
              path="/wallet"
              element={<WalletPage setAccount={setWalletAddress} />}
            />
            <Route
              path="/odineye"
              element={<ChatBotUI userId={walletAddress} />}
            />
            <Route path="/mint" element={<MintNFT />} />
          </Route>

          {/* COIN ROUTES */}
          <Route path="/coin/bitcoin" element={<BitcoinPage />} />
          <Route path="/coin/ethereum" element={<EthereumPage />} />
          <Route path="/coin/ripple" element={<XRP />} />
          <Route path="/coin/tether" element={<Tether />} />
          <Route path="/coin/binancecoin" element={<BNB />} />
          <Route path="/coin/solana" element={<Solana />} />
          <Route path="/coin/usd-coin" element={<USDC />} />
          <Route path="/coin/dogecoin" element={<Dogecoin />} />
          <Route path="/coin/steth" element={<StETH />} />
          <Route path="/coin/tron" element={<Tron />} />
          <Route path="/" element={<Hero />} />

          {/* Protected admin routes */}

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/nftadmin" element={<NFTAdminPage />} />
          </Route>

          {/* COMING SOON ROUTES */}
          <Route path="/coin/cardano" element={<ComingSoon />} />
          <Route path="/coin/wrapped-bitcoin" element={<ComingSoon />} />
          <Route path="/coin/hyperliquid" element={<ComingSoon />} />
          <Route path="/coin/wrapped-steth" element={<ComingSoon />} />
          <Route path="/coin/bitcoin-cash" element={<ComingSoon />} />
          <Route path="/coin/sui" element={<ComingSoon />} />
          <Route path="/coin/leo-token" element={<ComingSoon />} />
          <Route path="/coin/chainlink" element={<ComingSoon />} />
          <Route path="/coin/stellar" element={<ComingSoon />} />
          <Route path="/coin/avalanche" element={<ComingSoon />} />
          <Route path="/coin/usds" element={<ComingSoon />} />
          <Route path="/coin/toncoin" element={<ComingSoon />} />
          <Route path="/coin/whitebit-coin" element={<ComingSoon />} />
          <Route path="/coin/shiba-inu" element={<ComingSoon />} />
          <Route path="/coin/litecoin" element={<ComingSoon />} />
          <Route path="/coin/binance-peg-usdt" element={<ComingSoon />} />
          <Route path="/coin/weth" element={<ComingSoon />} />
          <Route path="/coin/wrapped-eeth" element={<ComingSoon />} />
          <Route path="/coin/hedera-hashgraph" element={<ComingSoon />} />
          <Route path="/coin/ethena-usde" element={<ComingSoon />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
