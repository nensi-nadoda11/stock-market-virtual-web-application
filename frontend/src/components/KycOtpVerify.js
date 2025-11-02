import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/KycOtpVerify.css";
import leftImg from "../assests/side-img2.png";
import logo from "../assests/remove-logo.png";

const KycOtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timer, setTimer] = useState(20);
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const token = sessionStorage.getItem("token");
  const [resendVisible, setResendVisible] = useState(false);

  const { userId, formData } = location.state || {};
  const [message, setMessage] = useState("");
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(new Array(6).fill(""));
  //auto countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setResendVisible(true);
    }
  }, [timer]);
  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, "");
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key == "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1].focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1].focus();
  };
  const handleResend = async () => {
    setOtp(new Array(6).fill(""));
    setTimer(20);
    setResendVisible(false);
    inputRefs.current[0].focus();
    console.log("userid ", userId);
    try {
      const res = await fetch(`${API}/kyc/kyc-resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      console.log("hello resend");
      const result = await res.json();
      console.log("hello resend");
      console.log(result.message);
      setMessage("OTP Resent");
    } catch (err) {
      console.error(err);
      setMessage("Failed to resend OTP");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Invalid session. Please start KYC again");
      return;
    }
    try {
      const data = new FormData();
      data.append("userId", userId);
      data.append("otp", otp);
      data.append("panNum", formData.panNum);
      data.append("aadhaarNum", formData.aadhaarNum);
      data.append("dob", formData.dob);
      data.append("dpType", formData.dpType);
      data.append("panImage", formData.panImage);
      data.append("aadhaarImage", formData.aadhaarImage);

      const res = await fetch(`${API}/kyc/kyc-verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(result.message || "KYC verified successfully");
        navigate("/detail");
      } else {
        setMessage(result.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };
  return (
    <div className="otp-container1">
      <div className="otp-left2">
        <img src={leftImg} alt="KYC" className="kyc-img" />
        <h2>Instant KYC</h2>
        <p>A strong opening for your investment journey</p>
      </div>

      <div className="otp-right">
        <img src={logo} alt="AngelOne" className="logo-img" />
        <h2>OTP Sent</h2>
        <p>
          We have sent an OTP to your mobile number and registered email address
        </p>

        <form onSubmit={handleVerify} className="otp-form">
          <label>Enter your OTP</label>
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[i] = el)}
                onChange={(e) => handleChange(e.target, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              />
            ))}
          </div>

          <div className="otp-timer">
            {resendVisible ? (
              <button
                type="button"
                onClick={handleResend}
                className="resend-btn"
              >
                Resend OTP
              </button>
            ) : (
              <span>00:{timer.toString().padStart(2, "0")}</span>
            )}
          </div>
          {message && <div className="toast">{message}</div>}
          <button className="proceed-btn" disabled={otp.includes("")}>
            PROCEED
          </button>
        </form>

        <p className="terms">
          By clicking PROCEED, I agree to the <a href="#">AOL TnC</a>,{" "}
          <a href="#">AFAPL TnC</a> &<a href="#"> RA T&C</a>. I authorise Angel
          One to access my credit report from bureaus on my behalf.
        </p>
      </div>
    </div>
  );
};

export default KycOtpVerify;
