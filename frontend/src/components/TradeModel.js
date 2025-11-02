import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/TradeModel.css";
import { io } from "socket.io-client";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const socket = io(`${API}`);

function TradeModal({ isOpen, onClose, type, stock, refreshOrders }) {
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState("MARKET");
  const [price, setPrice] = useState("");
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [bidPrices, setBidPrices] = useState([]);

  useEffect(() => {
    if (isOpen && stock) {
      setQuantity("");
      setOrderType("MARKET");
      setPrice(stock.currentPrice);
      setStopLossEnabled(false);
      setStopLossPrice("");
      socket.emit("subscribeBid", stock.symbol);
    }
  }, [isOpen, stock]);

  useEffect(() => {
    socket.on("updateBid", (data) => {
      if (stock && data.symbol === stock.symbol) {
        setBidPrices(data.bids);
      }
    });

    return () => socket.off("updateBid");
  }, [stock]);

  const handleTrade = async () => {
    if (!quantity || quantity <= 0) return alert("Enter valid quantity");
    if (orderType === "LIMIT" && (!price || price <= 0))
      return alert("Enter valid limit price");
    if (stopLossEnabled && (!stopLossPrice || stopLossPrice >= price))
      return alert("Stop loss price must be less than buy price");

    try {
      const res = await axios.post(
        `${API}/trade/${type}`,
        {
          symbol: stock.symbol,
          quantity: Number(quantity),
          limitPrice: orderType === "LIMIT" ? Number(price) : null,
          stopLossPrice: stopLossEnabled ? Number(stopLossPrice) : null,
          orderType,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      alert(res.data.message);
      onClose();
      if (refreshOrders) refreshOrders(); // refresh orders page after placing/modifying order
    } catch (error) {
      console.error("Trade error", error);
      alert(error.response?.data?.message || "Trade Failed");
    }
  };

  if (!isOpen || !stock) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{type === "buy" ? "Buy Stock" : "Sell Stock"}</h3>
        <p>
          <strong>
            {stock.symbol} - {stock.name}
          </strong>
        </p>
        <p>Current Price: ₹{stock.currentPrice.toFixed(2)}</p>

        {/* Order Type */}
        <div className="order-type">
          <label>
            <input
              type="radio"
              name="orderType"
              value="MARKET"
              checked={orderType === "MARKET"}
              onChange={() => {
                setOrderType("MARKET");
                setPrice(stock.currentPrice.toFixed(2));
              }}
            />
            Market
          </label>
          <label>
            <input
              type="radio"
              name="orderType"
              value="LIMIT"
              checked={orderType === "LIMIT"}
              onChange={() => setOrderType("LIMIT")}
            />
            Limit
          </label>
        </div>

        {/* Price input */}
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={orderType === "MARKET"}
        />

        {/* Quantity input */}
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* Stop Loss */}
        {type === "buy" && (
          <div className="stoploss-section">
            <label>
              <input
                type="checkbox"
                checked={stopLossEnabled}
                onChange={() => setStopLossEnabled(!stopLossEnabled)}
              />{" "}
              Enable Stop Loss
            </label>
            {stopLossEnabled && (
              <input
                type="number"
                placeholder="Stop Loss Price"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Bid Prices */}
        {bidPrices.length > 0 && (
          <div className="bid-prices">
            <h4>Bid Prices</h4>
            <ul>
              {bidPrices.map((bid, idx) => (
                <li key={idx}>₹{bid}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-actions">
          <button
            className={type === "buy" ? "buy-btn" : "sell-btn"}
            onClick={handleTrade}
          >
            {type === "buy" ? "Buy" : "Sell"}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeModal;
