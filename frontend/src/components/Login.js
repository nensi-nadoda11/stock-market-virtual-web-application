import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assests/remove-logo.png";
import sideimg from "../assests/login-side.jpg";
import "../style/login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
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
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        setMessage(`${data.message}`);
        console.log("navigate");
        navigate("/login-otp-verify", { state: { userEmail: formData.email } });
      } else {
        console.log("else");
        setMessage(`${data.message}`);
      }
    } catch (error) {
      setMessage(`Error:${error}`);
    }
  };
  return (
    <div>
      <div className="container1">
        <div className="left-section">
          <img src={sideimg} alt="Onboarding Banner" className="banner-img" />
          <div className="left-text">
            <h2>Smart Start</h2>
            <p>Your first step towards smart investing.</p>
          </div>
        </div>
        <div className="right-section">
          <img src={logo} alt=" Logo" className="logo1" />
          <h2 className="form-title">Login with your Email</h2>

          <form onSubmit={handleSubmit} className="form">
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
              type="password"
              id="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              required
              className="input-field"
            />

            <p className="otp-info">
              We will send an OTP to your mobile number or email
            </p>
            {message && <div className="toast">{message}</div>}

            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>
          <div className="link">
            Don't have an account ?<a href="/register">Register Now!</a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
