import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";
import "../style/WatchlistIcon.css";
import TradeModal from "./TradeModel";
//import { FaChartBar } from "react-icons/fa";

const socket = io("http://localhost:5000");

function Home() {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState("");
  const [modalOpen, setModelOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/stock/home");
        setStocks(res.data.data.stocks || []);
        setIndices(res.data.data.indices || []);

        const token = sessionStorage.getItem("token");
        const wlres = await axios.get(`http://localhost:5000/watchlist/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(wlres.data.watchlist || []);
      } catch (err) {
        console.error("Error fetching data", err.message);
      }
    };
    fetchData();
  }, []);

  // Socket listener
  useEffect(() => {
    socket.on("stockUpdated", (updatedStock) => {
      //setStocks((prev) =>
      //prev.map((s) => (s.symbol === updatedStock.symbol ? updatedStock : s))
      //);
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === updatedStock.symbol ? { ...updatedStock } : s
        )
      );
    });

    return () => {
      socket.off("stockUpdated");
    };
  }, []);

  const openTrade = (stock, type) => {
    setSelectedStock(stock);
    setTradeType(type);
    setModelOpen(true);
  };
  const isInWatchlist = (symbol) => {
    return watchlist.some((w) => w.stockSymbol === symbol);
  };
  const toggleWatchlist = async (stock) => {
    const token = sessionStorage.getItem("token");
    try {
      if (isInWatchlist(stock.symbol)) {
        const item = watchlist.find((w) => w.stockSymbol === stock.symbol);
        await axios.delete(`http://localhost:5000/watchlist/${item._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist((prev) =>
          prev.filter((w) => w.stockSymbol !== stock.symbol)
        );
      } else {
        const res = await axios.post(
          "http://localhost:5000/watchlist/add",
          { stockSymbol: stock.symbol },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWatchlist((prev) => [...prev, res.data]);
      }
    } catch (error) {
      console.error("Error updating watchlist", error.message);
    }
  };
  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="indices-section">
          <h2>Market Indices</h2>
          <div className="indices-grid">
            {indices.map((i) => (
              <div key={i._id} className="indice-card">
                <h3>{i.name}</h3>
                <p className="indice-value">{i.value.toFixed(2)}</p>
                <p
                  className={`indice-change ${
                    i.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {i.change} ({i.changePercent}%)
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="stocks-section">
          <h2>Stocks</h2>
          <table className="stocks-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Day High</th>
                <th>Day Low</th>
                <th>Available</th>
                <th>⭐ Watchlist</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s._id}>
                  <td>{s.symbol}</td>
                  <td>{s.name}</td>
                  <td
                    className={
                      s.lastPrice && s.currentPrice > s.lastPrice
                        ? "price-up"
                        : s.lastPrice && s.currentPrice < s.lastPrice
                        ? "price-down"
                        : ""
                    }
                  >
                    {console.log("curren Price", s.currentPrice.toFixed(2))}₹
                    {s.currentPrice.toFixed(2)}
                  </td>
                  <td>₹{s.dayHigh?.toFixed(2) || "-"}</td>
                  <td>₹{s.dayLow?.toFixed(2) || "-"}</td>
                  <td>{s.availableShares}</td>
                  <td>
                    <span
                      className={`star-icon ${
                        isInWatchlist(s.symbol) ? "filled" : "empty"
                      }`}
                      onClick={() => toggleWatchlist(s)}
                    >
                      ★
                    </span>
                  </td>
                  <td>
                    <button
                      className="buy-btn"
                      onClick={() => openTrade(s, "buy")}
                    >
                      Buy
                    </button>
                    <button
                      className="sell-btn"
                      onClick={() => openTrade(s, "sell")}
                    >
                      Sell
                    </button>
                    <button
                      className="chart-btn"
                      onClick={() => navigate(`/chart/${s.symbol}`)}
                    >
                      {" "}
                      Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TradeModal
        isOpen={modalOpen}
        onClose={() => setModelOpen(false)}
        stock={selectedStock}
        type={tradeType}
      />
    </>
  );
}

export default Home;
