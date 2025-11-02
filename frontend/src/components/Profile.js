import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/Portfolio.css";
import "../style/Profile.css";
import Navbar from "./Navbar";
import { useTheme } from "./Theme";

function Profile() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [kyc, setKyc] = useState(null);
  //const [theme,setTheme]=useState(localStorage.getItem("theme")||"light");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  useEffect(() => {
    //applyTheme(theme);
    fetchData();
  }, []);

  const tokenHeader = {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
  };

  const fetchData = async () => {
    try {
      const res1 = await axios.get(`${API}/profile/user`, tokenHeader);
      setUser(res1.data.user);
      console.log("user", res1.data.user);
      const res2 = await axios.get(
        `${API}/profile/account/details`,
        tokenHeader
      );
      setAccount(res2.data.account);
      console.log("account", res2.data.account);
      const res3 = await axios.get(`${API}/profile/kyc`, tokenHeader);
      setKyc(res3.data.kyc);
      console.log("kyc", res3.data.kyc);
    } catch (err) {
      console.error(err);
    }
  };

  const applyTheme = (t) => {
    document.body.classList.toggle("dark-theme", t === "dark");
    document.body.classList.toggle("light-theme", t === "light");
    localStorage.setItem("theme", t);
    setTheme(t);
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/profile/wallet/add`,
        { amount: amt },
        tokenHeader
      );
      setAccount((prev) => ({
        ...prev,
        walletBalance: res.data.walletBalance,
      }));
      setShowAddFunds(false);
      setFundAmount("");
      setMessage({ type: "success", text: "Funds added" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/profile/account/delete`, tokenHeader);
      sessionStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message });
      setShowDelete(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {message && (
          <div className={`msg ${message.type}`}>
            {message.text}
            <button className="close-msg" onClick={() => setMessage(null)}>
              ✕
            </button>
          </div>
        )}

        <div className="wallet-section">
          <h3>Wallet Balance</h3>
          <div className="wallet-row">
            <span>₹{account?.walletBalance?.toFixed(2) ?? 0}</span>
            <button className="btn" onClick={() => setShowAddFunds(true)}>
              Add Funds
            </button>
          </div>
        </div>

        <div className="theme-section">
          <h3>Theme</h3>
          <label>
            <input
              type="radio"
              checked={theme === "light"}
              onChange={() => applyTheme("light")}
            />{" "}
            Light
          </label>
          <label>
            <input
              type="radio"
              checked={theme === "dark"}
              onChange={() => applyTheme("dark")}
            />{" "}
            Dark
          </label>
        </div>

        <div className="profile-section">
          <button className="btn" onClick={() => setShowProfile(true)}>
            Profile Details
          </button>
        </div>

        <div className="account-section">
          <button className="btn" onClick={() => setShowAccount(true)}>
            Account Details
          </button>
        </div>

        <div className="action-section">
          <button className="btn danger" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="btn danger-outline"
            onClick={() => setShowDelete(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddFunds && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Add Funds</h4>
            <form onSubmit={handleAddFunds}>
              <input
                type="number"
                placeholder="Amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                min="1"
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddFunds(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Profile Details</h4>
            <p>
              <strong>Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>DOB:</strong> {new Date(user?.dob).toLocaleDateString()}
            </p>
            <p>
              <strong>Mobile:</strong> {user?.mobile}
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowProfile(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccount && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Account Details</h4>
            <p>
              <strong>Client ID:</strong> {account?.clientId}
            </p>
            <p>
              <strong>BO ID:</strong> {account?.boId}
            </p>
            <p>
              <strong>DP ID:</strong> {account?.dpId}
            </p>
            <p>
              <strong>Account Type:</strong> {account?.accountType}
            </p>
            <p>
              <strong>DP Type:</strong> {account?.dpType}
            </p>
            <p>
              <strong>PanNumber:</strong>
              {kyc?.panNum}
            </p>
            <p>
              <strong>Aadhaar Number:</strong>
              {kyc?.aadhaarNum}
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowAccount(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Delete Account</h4>
            <p>Are you sure? Holdings must be cleared first.</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowDelete(false)}>
                Cancel
              </button>
              <button className="btn danger" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
