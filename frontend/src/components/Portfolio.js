import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/Portfolio.css";
import Navbar from "./Navbar";
import { io } from "socket.io-client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(`${API}`, {
  transports: ["websocket"],
});

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [transactions, setTransactions] = useState({});

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`${API}/trade/portfolio`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        setPortfolio(res.data.portfolio || []);
      } catch (error) {
        console.error("Eror fetching portfolio", error.message);
      }
    };
    fetchPortfolio();
  }, []);
  useEffect(() => {
    socket.on("stockUpdated", (updatedStock) => {
      // agar stock portfolio me hai to price update karo
      setPortfolio((prev) =>
        prev.map((stock) =>
          stock.symbol === updatedStock.symbol
            ? {
                ...stock,
                currentPrice: updatedStock.currentPrice,
              }
            : stock
        )
      );
    });

    return () => socket.off("stockUpdated");
  }, []);
  const fetchTransactions = async (symbol) => {
    try {
      const res = await axios.get(
        `${API}/trade/portfolio/${symbol}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setTransactions((prev) => ({ ...prev, [symbol]: res.data.transactions }));
    } catch (err) {
      console.error("Error fetching transactions", err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="portfolio-container">
        <h2>📊 Your Portfolio</h2>
        {portfolio.length === 0 ? (
          <p className="empty-msg">you don't have any holding yet.</p>
        ) : (
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Avg Price</th>
                <th>Current Price</th>
                <th>Invested Amount</th>
                <th>Current Value</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item, index) => {
                const isProfit = item.profitLoss >= 0;
                return (
                  <React.Fragment key={index}>
                    <tr
                      className="portfolio-row"
                      onClick={() => {
                        if (expandedRow === item.symbol) {
                          setExpandedRow(null);
                        } else {
                          setExpandedRow(item.symbol);
                          if (!transactions[item.symbol]) {
                            fetchTransactions(item.symbol);
                          }
                        }
                      }}
                    >
                      <td>{item.symbol}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.avgPrice.toFixed(2)}</td>
                      <td>₹{item.currentPrice.toFixed(2)}</td>
                      <td>₹{item.investedAmount.toFixed(2)}</td>
                      <td>₹{item.currentValue.toFixed(2)}</td>
                      <td className={`pl-cell ${isProfit ? "profit" : "loss"}`}>
                        {isProfit ? (
                          <>
                            <ArrowUpRight className="arrow-icon" />₹
                            {item.profitLoss.toFixed(2)} (
                            {item.profitLossPercent}%)
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="arrow-icon" />₹
                            {item.profitLoss.toFixed(2)} (
                            {item.profitLossPercent}%)
                          </>
                        )}
                      </td>
                    </tr>
                    {expandedRow === item.symbol && (
                      <tr className="transaction-row">
                        <td colSpan="7">
                          {transactions[item.symbol] ? (
                            <ul className="transaction-list">
                              {transactions[item.symbol].map((t, i) => (
                                <li key={i}>
                                  <span className={`txn-type ${t.type}`}>
                                    {t.type}
                                  </span>
                                  {""}
                                  <b>{t.quantity} </b>Buy at{" "}
                                  <b> ₹{t.price.toFixed(2)} </b> on{"   "}
                                  <b>
                                    {" "}
                                    {new Date(t.date).toLocaleDateString()}
                                  </b>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="txn-loading">Loading...</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Portfolio;
