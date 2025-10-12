import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "../style/OrderPage.css";
import axios from "axios";
import Navbar from "./Navbar";

const socket = io("http://localhost:5000");

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modQuantity, setModQuantity] = useState("");
  const [modLimitPrice, setModLimitPrice] = useState("");
  const [modStopLossPrice, setModStopLossPrice] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/trade/orders", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.error("Fetch orders error", error);
    }
  };

  useEffect(() => {
    fetchOrders();

    socket.on("orderUpdate", (update) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === update.orderId
            ? { ...o, status: update.status, executionPrice: update.executionPrice }
            : o
        )
      );
    });

    return () => socket.off("orderUpdate");
  }, []);

  const openModifyModal = (order) => {
    setSelectedOrder(order);
    setModQuantity(order.quantity);
    setModLimitPrice(order.limitPrice || "");
    setModStopLossPrice(order.stopLossPrice || "");
    setModifyModalOpen(true);
  };

  const handleModifyOrder = async () => {
    if (!modQuantity || modQuantity <= 0) return alert("Enter valid quantity");
    try {
      const res = await axios.put(
        `http://localhost:5000/trade/orders/${selectedOrder._id}/modify`,
        {
          quantity: Number(modQuantity),
          limitPrice: Number(modLimitPrice),
          stopLossPrice: modStopLossPrice ? Number(modStopLossPrice) : null,
        },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        }
      );
      alert(res.data.message);
      fetchOrders();
      setModifyModalOpen(false);
    } catch (err) {
      console.error("Modify order error", err);
      alert(err.response?.data?.message || "Order modification failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="orders-page">
        <h2>My Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Stock</th>
              <th>Type</th>
              <th>Side</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Executed Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className={
                  order.status === "EXECUTED"
                    ? "executed"
                    : order.status === "CANCELLED"
                    ? "cancelled"
                    : ""
                }
              >
                <td>{order.stockSymbol}</td>
                <td>{order.orderType}</td>
                <td>{order.side}</td>
                <td>{order.quantity}</td>
                <td>{order.limitPrice || "-"}</td>
                <td>{order.status}</td>
                <td>{order.executionPrice || "-"}</td>
                <td>
                  {order.status === "PENDING" && (
                    <button className="modify-btn" onClick={() => openModifyModal(order)}>
                      Modify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modify Order Modal */}
      {modifyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Modify Order - {selectedOrder.stockSymbol}</h3>
            <input
              type="number"
              placeholder="Quantity"
              value={modQuantity}
              onChange={(e) => setModQuantity(e.target.value)}
            />
            <input
              type="number"
              placeholder="Limit Price"
              value={modLimitPrice}
              onChange={(e) => setModLimitPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Stop Loss Price"
              value={modStopLossPrice}
              onChange={(e) => setModStopLossPrice(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modify-confirm-btn" onClick={handleModifyOrder}>
                Update
              </button>
              <button className="cancel-btn" onClick={() => setModifyModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrdersPage;
