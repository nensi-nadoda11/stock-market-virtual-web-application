import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Detail = () => {
  const [clientId, setClientId] = useState("");
  const [boId, setBoId] = useState("");
  const [dpId, setDpId] = useState("");
  const [dpType, setDpType] = useState("");

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    //  e.preventDefault()
    const userId = sessionStorage.getItem("userId");
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/kyc/user-kyc-detail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const result = await res.json();
        setClientId(result.clientId);
        setBoId(result.boId);
        setDpId(result.dpId);
        setDpType(result.dpType);
        console.log(result.message);
      } catch (error) {
        setClientId("something went wrong");
      }
    };
    fetchDetail();
  }, []);
  localStorage.setItem("dpId", dpId);
  localStorage.setItem("dpType", dpType);

  const handleClick = () => {
    navigate("/home");
  };

  return (
    <div className="detail-container">
      <div className="detail-card">
        <h2 className="detail-heading">Account Details</h2>
        <div className="detail-info">
          <h1>Client Id : {clientId}</h1>
          <h1>Bo Id :{boId}</h1>
          <h1>Dp Id :{dpId}</h1>
          <h1>Dp Type : {dpType}</h1>
        </div>
        <button type="submit" onClick={handleClick} className="detail-btn">
          Done
        </button>
      </div>
    </div>
  );
};

export default Detail;
