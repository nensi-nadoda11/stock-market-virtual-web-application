import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../style/Ipo.css";
import ApplyIpo from "./ApplyIpo";
import Application from "./Application"; // naya component for showing user applications

const IPOPage = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIpo, setSelectedIpo] = useState(null);
  const [activeTab, setActiveTab] = useState("open"); // default open
  const [showApplications, setShowApplications] = useState(false); // naya state

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        const res = await fetch("http://localhost:5000/ipo");
        const data = await res.json();
        if (data) setIpos(data.data);
        else setIpos([]);
      } catch (error) {
        console.error("Error fetching IPOs:", error);
        setIpos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIpos();
  }, []);

  // Filter IPOs based on tab
  //const filteredIpos = ipos.filter((ipo) => ipo.status.toLowerCase() === activeTab);
// Filter IPOs based on tab
const filteredIpos = Array.isArray(ipos)
  ? ipos.filter((ipo) => ipo.status.toLowerCase() === activeTab)
  : [];

  return (
    <div className="ipo-page">
      <Navbar />
      <div className="ipo-container">
        <h2 className="ipo-title">IPO Section</h2>

        {/* Tabs */}
        <div className="ipo-tabs">
          <button
            className={`ipo-tab ${activeTab === "open" ? "active" : ""}`}
            onClick={() => setActiveTab("open")}
          >
            Open IPOs
          </button>
          <button
            className={`ipo-tab ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming IPOs
          </button>
          <button
            className={`ipo-tab ${activeTab === "closed" ? "active" : ""}`}
            onClick={() => setActiveTab("closed")}
          >
            Closed IPOs
          </button>
        </div>

        {/* View My Applications button */}
        <div style={{ textAlign: "center", margin: "15px 0" }}>
          <button
            className="view-apps-btn"
            onClick={() => setShowApplications(true)}>
              {console.log("true or false",showApplications)}
            My Applications
          </button>
        </div>

        {loading ? (
          <p className="ipo-loading">Loading IPOs...</p>
        ) : (
          <div className="ipo-grid">
            {filteredIpos.length > 0 ? (
              filteredIpos.map((ipo) => (
                <div key={ipo._id} className="ipo-card">
                  <h3 className="ipo-name">{ipo.companyName || "N/A"}</h3>
                  <p className="ipo-info">
                    <strong>Closes On:</strong>{" "}
                    {ipo.offerEndDate
                      ? new Date(ipo.offerEndDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="ipo-info">
                    <strong>Price:</strong>{" "}
                    {ipo.priceRange || `₹${ipo.pricePerShare}`}
                  </p>
                  <p className="ipo-info">
                    <strong>Lot Size:</strong> {ipo.lotSize}
                  </p>
                  <p className="ipo-info">
                    <strong>Status:</strong>{" "}
                    <span className={`ipo-status ${ipo.status}`}>
                      {ipo.status}
                    </span>
                  </p>
                  <button
                    className="apply-btn"
                    disabled={ipo.status.toLowerCase() !== "open"}
                    onClick={() => setSelectedIpo(ipo)}
                  >
                    Apply
                  </button>
                </div>
              ))
            ) : (
              <p className="no-ipo">No IPOs available.</p>
            )}
          </div>
        )}
      </div>

      {/* Apply IPO modal */}
      {selectedIpo && (
        <ApplyIpo ipo={selectedIpo} onClose={() => setSelectedIpo(null)} />
      )}

      {/* My Applications modal */}
      {showApplications && (
        <Application onClose={() => setShowApplications(false)} />
      )}
    </div>
  );
};

export default IPOPage;
