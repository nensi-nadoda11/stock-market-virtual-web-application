import React from "react";
import { Link } from "react-router-dom";
import logo from "../assests/flogor.png";
import "../style/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />

        <span className="navbar-title">StockSim</span>
      </div>
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/transaction">History</Link>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/ipo">IPO</Link>
      </div>
    </nav>
  );
}

export default Navbar;
