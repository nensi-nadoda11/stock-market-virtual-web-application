import { useEffect, useState } from "react";
import axios from "axios";
import "../style/Transaction.css";
import ConfirmPopUp from "./ConfirmPopUp";
import Navbar from "./Navbar";

function TransactionHistory() {
  const [transaction, setTransaction] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const token = sessionStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTransaction();
  }, []);
  const fetchTransaction = async () => {
    try {
      const res = await axios.get(`${API}/trade/transaction`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransaction(res.data.transaction);
      console.log("data", res.data.transaction);
    } catch (error) {
      console.error("Error fetching Transaction", error);
    }
  };

  const handleDeleteClick = (type, id = null) => {
    setDeleteType(type);
    setSelectedId(id);
    setPopupOpen(true);
  };
  const confirmDelete = async () => {
    try {
      if (deleteType == "single" && selectedId) {
        await axios.delete(`${API}/trade/deletehistory/${selectedId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (deleteType == "all") {
        const res = await axios.delete(`${API}/trade/deleteallhistory`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const val = res.data.value;
        console.log("value", val);
      }
      fetchTransaction();
    } catch (error) {
      console.error("error deleting transaction", error);
    } finally {
      setPopupOpen(false);
      setSelectedId(null);
      setDeleteType(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="transaction-container">
        <div className="transaction-card">
          <h2 className="transaction-title">📊 Transaction History</h2>
          <div className="table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>
                    Delete{" "}
                    <button
                      className="delete-all-btn"
                      onClick={() => handleDeleteClick("all")}
                    >
                      🗑️
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transaction.length == 0 ? (
                  <tr>
                    <td colSpan="5" className="no-transaction">
                      No Transaction Yet.
                    </td>
                  </tr>
                ) : (
                  transaction.map((tx, index) => {
                    const isBuy = tx.type == "BUY";
                    return (
                      <tr key={index}>
                        <td className="stock-symbol">{tx.stockSymbol}</td>
                        <td className={isBuy ? "buy-type" : "sell-type"}>
                          {tx.type}
                        </td>
                        <td>{tx.quantity}</td>
                        <td className={isBuy ? "buy-price" : "sell-price"}>
                          ₹{tx.price.toFixed(2)}
                        </td>
                        <td>{new Date(tx.date).toLocaleString()}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteClick("single", tx._id)}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {popupOpen && (
          <ConfirmPopUp
            onConfirm={confirmDelete}
            onCancel={() => setPopupOpen(false)}
          />
        )}
      </div>
    </>
  );
}
export default TransactionHistory;
