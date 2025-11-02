import React, { useState, useEffect } from "react";
import "../style/Register.css";
import { useNavigate } from "react-router-dom";
import logo from "../assests/remove-logo.png";
import sideimg from "../assests/side-img.png";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleChange = async (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setMessage(`${data.message}`);

        navigate("/otp", { state: { userData: formData } });
      } else setMessage(`${data.message || data.msg}`);
    } catch (err) {
      setMessage(`Error:${err.message}`);
    }
  };
  return (
    <div className="container3">
      <div className="left-section4">
        <img src={sideimg} alt="Onboarding Banner" className="banner-img" />
        <div className="left-text4">
          <h2>Minimum Documents. Quick Onboarding.</h2>
          <p>Start with just PAN Card, Aadhaar Card.</p>
        </div>
      </div>
      <div className="right-section">
        <img src={logo} alt=" Logo" className="logo3" />
        <h2 className="form-title">
          Register with your Email or Mobile Number
        </h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            id="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            required
            className="input-field"
          />
          <input
            type="email"
            id="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            className="input-field"
          />
          <input
            type="date"
            id="dob"
            placeholder="Date of Birth"
            onChange={handleChange}
            value={formData.dob}
            required
            className="input-field"
          />
          <input
            type="text"
            id="mobile"
            placeholder="Mobile No"
            onChange={handleChange}
            value={formData.mobile}
            required
            className="input-field"
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            className="input-field"
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            value={formData.confirmPassword}
            required
            className="input-field"
          />
          <p className="otp-info">
            We will send an OTP to your mobile number or email
          </p>
          {message && <div className="toast">{message}</div>}

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
        {/* <a href='/login'>if you have already account</a>*/}
      </div>
    </div>
  );
}
export default Register;
