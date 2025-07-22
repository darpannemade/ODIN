import React, { useEffect, useState } from "react";
import "./bitcoin.css";
import TradingViewWidget from "./TradingViewWidget";
import { Link } from "react-router-dom";

function USDC() {
  const [coin, setCoin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/usd-coin?localization=false");
      const data = await res.json();
      setCoin(data);
    };
    fetchData();
  }, []);

  if (!coin) {
    return (
      <div className="btc-loading">
        <div className="loading-spinner"></div>
        <p>Loading USDC data...</p>
      </div>
    );
  }

  return (
    <div className="btc-container">
      <div className="btc-left">
        <h2 className="btc-title">About USD Coin</h2>
        <p className="btc-desc">{coin.description.en.split(". ")[0]}.</p>
        <div className="btc-links">
          <a href={coin.links.whitepaper} target="_blank" rel="noreferrer">
            <button className="btc-tag">Whitepaper</button>
          </a>
          <a href={coin.links.homepage[0]} target="_blank" rel="noreferrer">
            <button className="btc-tag">Official Website</button>
          </a>
        </div>
        <div className="btc-explore-card">
          <p className="explore-title">Keep exploring</p>
          <p className="explore-desc">View assets on the same network and more with search</p>
          <Link to="/market" className="explore-btn">Explore →</Link>
        </div>
      </div>
      <div className="btc-right">
        <div className="btc-price-row">
          <h1 className="btc-price">USDC - ₹{coin.market_data.current_price.inr.toLocaleString()}</h1>
          <span className={`btc-change ${coin.market_data.price_change_percentage_24h >= 0 ? "green" : "red"}`}>
            {coin.market_data.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
        <div className="btc-chart-container">
          <TradingViewWidget symbol="BINANCE:USDCUSDT" />
        </div>
        <div className="btc-stats-grid">
          <div>
            <h3 className="MarketStat">Market Stats</h3>
            <ul>
              <li><strong>Market Cap:</strong> ₹{coin.market_data.market_cap.inr.toLocaleString()}</li>
              <li><strong>24h Volume:</strong> ₹{coin.market_data.total_volume.inr.toLocaleString()}</li>
              <li><strong>Circulating Supply:</strong> {coin.market_data.circulating_supply.toLocaleString()} USDC</li>
              <li><strong>Total Supply:</strong> {coin.market_data.total_supply?.toLocaleString() || "N/A"} USDC</li>
              <li><strong>All Time High:</strong> ₹{coin.market_data.ath.inr.toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default USDC;
