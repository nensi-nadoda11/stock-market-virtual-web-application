import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/KycVerify.css";
import logo from "../assests/remove-logo.png";
import leftImg from "../assests/side-img2.png";

const KycVerify = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const token = sessionStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [formData, setFormData] = useState({
    panNum: "",
    aadhaarNum: "",
    dob: "",
    dpType: " ",
    panImage: null,
    aadhaarImage: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData((prev) => ({ ...prev, [name]: files[0] }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      setMessage("User not Logged in");
      return;
    }

    console.log("frontend token", token);
    try {
      setLoading(true);
      const res = await fetch(`${API}/kyc/kyc-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          panNum: formData.panNum,
          aadhaarNum: formData.aadhaarNum,
          dob: formData.dob,
          dpType: formData.dpType,
        }),
      });
      const result = await res.json();
      console.log(result);
      setLoading(false);

      if (res.ok) {
        setMessage(
          result.message || "OTP sent to your Aadhaar Linked Mobile Number"
        );
        navigate("/kyc-otp-verify", { state: { userId, formData } });
      } else {
        setMessage(result.message || "Failed to Send OTP");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setMessage("Somrthing went wrong");
    }
  };

  return (
    <div className="container2">
      <div className="left-section1">
        <img src={leftImg} alt="Onboarding Banner" className="banner-img1" />
        <div className="left-text2">
          <h2>Instant KYC</h2>
          <p>A strong opening for your investment journey</p>
        </div>
      </div>

      <div className="right-section">
        <img src={logo} alt=" Logo" className="logo2" />
        <h2 className="form-title2">
          Register with your Email or Mobile Number
        </h2>
        <form onSubmit={handleSubmit} className="form">
          <div>
            <label className="label1">PAN Number :</label>
            <input
              type="text"
              name="panNum"
              value={formData.panNum}
              onChange={handleChange}
              required
              className="input-field1"
            />
          </div>
          <div>
            <label className="label1">Aadhaar Number :</label>
            <input
              type="text"
              name="aadhaarNum"
              value={formData.aadhaarNum}
              onChange={handleChange}
              required
              className="input-field1"
            />
          </div>
          <div>
            <label className="label1">Date Of Birth :</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="input-field1"
            />
          </div>
          <div>
            <label className="label1">Depository Type :</label>
            <select
              name="dpType"
              value={formData.dpType}
              onChange={handleChange}
              required
              className="input-field1"
            >
              <option value="">Select</option>
              <option value="NSDL">NSDL</option>
              <option value="CDSL">CDSL</option>
            </select>
          </div>

          <div>
            <label className="label1">PAN card Image :</label>
            <input
              type="file"
              name="panImage"
              accept="image/*"
              onChange={handleChange}
              required
              className="input-field1"
            />
          </div>
          <div>
            <label className="label1">Aadhaar Card Image :</label>
            <input
              type="file"
              name="aadhaarImage"
              accept="image/*"
              onChange={handleChange}
              required
              className="input-field1"
            />
          </div>
          {message && <div className="toast">{message}</div>}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Sending OTP..." : "Submit & Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KycVerify;
