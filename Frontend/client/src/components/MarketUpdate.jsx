import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./MarketUpdate.css";

function MarketUpdate() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${currentPage}&sparkline=false`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("The Aether is currently clouded. Unable to fetch live data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  const paginationButtons = [1, 2, 3, 4, 5];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="market-page page-enter">
      <div className="cosmic-bg" />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        
        <motion.div 
          className="market-header text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="aether-line mx-auto" style={{ margin: "0 auto 1.5rem" }} />
          <h1 className="market-title">Live <span className="text-violet">Market Data</span></h1>
          <p className="market-subtitle">Track the pulse of the cosmic economy in real-time.</p>
        </motion.div>

        <motion.div 
          className="market-card aether-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="market-content custom-scrollbar">
            {loading ? (
              <div className="market-state market-loading">
                <div className="orb-scanner"></div>
                <p>Scrying the Aether...</p>
              </div>
            ) : error ? (
              <div className="market-state market-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <p>{error}</p>
              </div>
            ) : (
              <table className="market-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th className="text-right">Price (USD)</th>
                    <th className="text-right">24h Change</th>
                    <th className="text-right hidden-mobile">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="market-row"
                      data-symbol={item.symbol.toLowerCase()}
                    >
                      <td>
                        <Link to={`/coin/${item.id}`} className="coin-link">
                          <img src={item.image} alt={item.name} className="coin-img" />
                          <div className="coin-info">
                            <span className="coin-name">{item.name}</span>
                            <span className="coin-symbol text-muted">{item.symbol.toUpperCase()}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="text-right value-cell">
                        ${(item.current_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </td>
                      <td className="text-right">
                        <span className={`change-badge ${(item.price_change_percentage_24h ?? 0) > 0 ? "positive" : "negative"}`}>
                          {(item.price_change_percentage_24h ?? 0) > 0 ? "+" : ""}
                          {(item.price_change_percentage_24h ?? 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right value-cell hidden-mobile">
                        ${(item.market_cap ?? 0).toLocaleString()}
                      </td>
                    </motion.tr>

                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && !error && (
            <div className="market-pagination">
              {paginationButtons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => setCurrentPage(btn)}
                  className={`btn-page ${btn === currentPage ? "active" : ""}`}
                >
                  {btn}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default MarketUpdate;
