import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MarketUpdate.css";

function MarketUpdate() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiLoad, setApiLoad] = useState(true);

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${currentPage}&sparkline=false`;

  useEffect(() => {
    const fetchData = async () => {
      setApiLoad(true);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API fetch failed");
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setApiLoad(false);
      }
    };
    fetchData();
  }, [url]);

  const numberWithCommas = (x) =>
    x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const paginationButtons = Array.from({ length: 5 }, (_, i) => i + 1).map(
    (num) => (
      <button
        key={num}
        onClick={() => setCurrentPage(num)}
        className={`market-pagination-button ${
          currentPage === num ? "active-page" : ""
        }`}
      >
        {num}
      </button>
    )
  );

  return (
    <section className="market-section">
      <div className="market-container">
        <h2 className="market-heading">Market Update</h2>

        <div className="market-table-header">
          <p>Coin</p>
          <p>Price</p>
          <p>24h Change</p>
          <p>Market Cap</p>
        </div>

        {apiLoad ? (
          <p className="market-loading">Loading market data...</p>
        ) : (
          data.map((coin) => (
            <Link to={`/coin/${coin.id}`} key={coin.id} className="market-row">
              <div className="market-coin-wrap">
                <img src={coin.image} alt={coin.name} className="market-coin-img" />
                <span>{coin.name}</span>
              </div>
              <p>${coin.current_price.toFixed(2)}</p>
              <p
                className={`market-change ${
                  coin.price_change_percentage_24h >= 0 ? "green" : "red"
                }`}
              >
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </p>
              <p>${numberWithCommas(coin.market_cap)}</p>
            </Link>
          ))
        )}

        <div className="market-pagination">{paginationButtons}</div>
      </div>
    </section>
  );
}

export default MarketUpdate;
