import React from "react";
import "../style/IpoCard.css";

const IpoCard = ({ ipo }) => {
  return (
    <div className="ipo-card">
      <h3 className="ipo-name">{ipo.name}</h3>
      <p className="ipo-detail">Price: ₹{ipo.price}</p>
      <p className="ipo-detail">Open Date: {ipo.openDate}</p>
      <p className="ipo-detail">Close Date: {ipo.closeDate}</p>
      <button className="ipo-btn">Apply Now</button>
    </div>
  );
};

export default IpoCard;
