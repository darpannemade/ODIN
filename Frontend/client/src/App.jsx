import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import SiteIntro from "./components/SiteIntro";
import MarketUpdate from "./components/MarketUpdate";
import WalletPage from "./components/WalletPage";
import ChooseSection from "./components/ChooseSection";
import Register from "./auth/Register";
import Login from "./auth/Login";
import UserProfilePage from "./User/UserProfilePage";

// Coins
import BitcoinPage from "./coinpages/Bitcoin";
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

// NFT
import MintNFT from "./NFTmarket/MintNFT";
import Marketplace from "./NFTmarket/Marketplace";
import NFTAdminPage from "./NFTmarket/NFTAdminPage";
import NFThome from "./NFTmarket/NFThome";
import LandingPage from "./NFTmarket/LandingPage";
import FullMarketUI from "./NFTmarket/FullMarketUI";
import ManageNFT from "./NFTmarket/ManageNFT";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./components/AdminDashboard";
import ChatBotUI from "./components/ChatBotUI";

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 15 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -15 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Wrapper component to apply animations to all routes automatically
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="page-enter w-full"
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const location = useLocation();

  return (
    <div className="relative min-h-screen flex flex-col">
      <SiteIntro />
      <Navbar />
      
      {/* 
        We use flex-grow to ensure the footer stays at the bottom.
        Warning: Bifrost FullMarketUI uses its own fixed sidebar, so 
        the padding might need slight adjustments if we applied generic padding here.
        Instead, we let components handle their own padding.
      */}
      <main className="flex-grow flex flex-col w-full relative pt-[var(--nav-height)]">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* PUBLIC PAGE ROUTES */}
            <Route path="/" element={<AnimatedPage><Hero /></AnimatedPage>} />
            <Route path="/market" element={<AnimatedPage><MarketUpdate /></AnimatedPage>} />
            <Route path="/choose" element={<AnimatedPage><ChooseSection /></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />

            {/* PROTECTED USER ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/marketplace" element={<AnimatedPage><FullMarketUI /></AnimatedPage>} />
              <Route path="/marketplace1" element={<AnimatedPage><Marketplace /></AnimatedPage>} />
              <Route path="/bifrost1" element={<AnimatedPage><NFThome /></AnimatedPage>} />
              <Route path="/bifrost" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
              <Route path="/wallet" element={<AnimatedPage><WalletPage /></AnimatedPage>} />
              <Route path="/manageNFT" element={<AnimatedPage><ManageNFT /></AnimatedPage>} />
              
              <Route
                path="/odineye"
                element={<AnimatedPage><ChatBotUI userId={walletAddress} /></AnimatedPage>}
              />
              <Route path="/mint" element={<AnimatedPage><MintNFT /></AnimatedPage>} />
            </Route>

            {/* PROTECTED ADMIN ROUTES */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
              <Route path="/nftadmin" element={<AnimatedPage><NFTAdminPage /></AnimatedPage>} />
            </Route>

            {/* COIN ROUTES (Public) */}
            <Route path="/coin/bitcoin" element={<AnimatedPage><BitcoinPage /></AnimatedPage>} />
            <Route path="/coin/ethereum" element={<AnimatedPage><EthereumPage /></AnimatedPage>} />
            <Route path="/coin/ripple" element={<AnimatedPage><XRP /></AnimatedPage>} />
            <Route path="/coin/tether" element={<AnimatedPage><Tether /></AnimatedPage>} />
            <Route path="/coin/binancecoin" element={<AnimatedPage><BNB /></AnimatedPage>} />
            <Route path="/coin/solana" element={<AnimatedPage><Solana /></AnimatedPage>} />
            <Route path="/coin/usd-coin" element={<AnimatedPage><USDC /></AnimatedPage>} />
            <Route path="/coin/dogecoin" element={<AnimatedPage><Dogecoin /></AnimatedPage>} />
            <Route path="/coin/steth" element={<AnimatedPage><StETH /></AnimatedPage>} />
            <Route path="/coin/tron" element={<AnimatedPage><Tron /></AnimatedPage>} />

            {/* COMING SOON COIN ROUTES */}
            <Route path="/coin/cardano" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/wrapped-bitcoin" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/hyperliquid" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/wrapped-steth" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/bitcoin-cash" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/sui" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/leo-token" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/chainlink" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/stellar" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/avalanche" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/usds" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/toncoin" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/whitebit-coin" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/shiba-inu" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/litecoin" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/binance-peg-usdt" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/weth" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/wrapped-eeth" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/hedera-hashgraph" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
            <Route path="/coin/ethena-usde" element={<AnimatedPage><ComingSoon /></AnimatedPage>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
