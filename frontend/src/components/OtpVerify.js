import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/OtpVerify.css";
import leftImg from "../assests/side-img.png";
import logo from "../assests/remove-logo.png";

const OtpVerify = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [resendVisible, setResendVisible] = useState(false);
  const [message, setMessage] = useState("");
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;

  const inputRefs = useRef([]);

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
    setTimer(60);
    setResendVisible(false);
    inputRefs.current[0].focus();

    try {
      const res = await fetch(`${API}/api/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const result = await res.json();
      console.log(result);
      setMessage("OTP Resent");
    } catch (err) {
      console.error(err);
      setMessage("Failed to resend OTP");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(userData.email);
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6 && userData) {
      console.log("Submitting OTP:", enteredOtp);
      try {
        const res = await fetch(`${API}/api/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp: enteredOtp.trim(),
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            dob: userData.dob,
            password: userData.password,
          }),
        });
        const result = await res.json();
        console.log(result);
        if (res.ok) {
          setMessage(result.msg || "OTP verified successfully");
          sessionStorage.setItem("token", result.token);
          sessionStorage.setItem("userId", result.user._id);
          navigate("/kyc-verify");
        } else {
          setMessage(result.msg);
        }
      } catch (err) {
        console.error(err);
        setMessage("Something went wrong");
      }
    } else {
      setMessage("Please enter complete OTP");
    }
  };
  return (
    <div className="otp-container">
      <div className="otp-left1">
        <img src={leftImg} alt="KYC" className="kyc-img" />
        <h2>Minimum Documents. Quick Onboarding.</h2>
        <p>Start with just PAN Card, Aadhaar Card.</p>
      </div>

      <div className="otp-right">
        <img src={logo} alt="AngelOne" className="logo-img" />
        <h2>OTP Sent</h2>
        <p>
          We have sent an OTP to your mobile number and registered email address
        </p>

        <form onSubmit={handleSubmit} className="otp-form">
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
export default OtpVerify;
