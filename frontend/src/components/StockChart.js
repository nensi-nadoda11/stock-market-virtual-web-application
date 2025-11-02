import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { createChart } from "lightweight-charts"; // v3.8

const StockChartPage = () => {
  const { symbol } = useParams();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartContainer = useRef(null);
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Data fetch
  useEffect(() => {
    const fetchChartData = async (e) => {
      //   e.preventDefault()
      try {
        const res = await axios.get(`${API}/stockchart/${symbol}/chart`);
        console.log(res.data);
        setChartData(res.data.chartData || []);
        setLoading(false);
        //console.log("chartData:",chartData)
      } catch (err) {
        console.error("Chart Load Error:", err);
        setError("Chart data load failed. Please try again.");
        setLoading(false);
      }
    };
    fetchChartData();
  }, [symbol]);
  useEffect(() => {
    console.log("Updated chartData:", chartData);
  }, [chartData]);

  // Chart create
  useEffect(() => {
    if (!chartContainer.current || chartData.length === 0) return;

    const chart = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth || 800,
      height: 500,
      layout: {
        backgroundColor: "#120101ff", // v3.8 syntax
        textColor: "#faf9f9ff",
      },
      grid: {
        vertLines: { color: "#3423cdff" },
        horzLines: { color: "#3423cdff" },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "rgba(0, 255, 0, 1)",
      downColor: "#f00",
      borderUpColor: "#0f0",
      borderDownColor: "#f00",
      wickUpColor: "#0f0",
      wickDownColor: "#f00",
    });

    candleSeries.setData(
      chartData
        .filter(
          (d) =>
            d &&
            d.time != null &&
            d.open != null &&
            d.high != null &&
            d.low != null &&
            d.close != null
        )

        .map((d) => ({
          time: d.time, // already in epoch seconds
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
    );

    // Handle resize
    const handleResize = () => {
      if (chartContainer.current) {
        chart.applyOptions({ width: chartContainer.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [chartData]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", backgroundColor: "#ffffff" }}>
        <h2>{symbol} Chart</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : chartData.length === 0 ? (
          <p>No data available</p>
        ) : (
          <div
            ref={chartContainer}
            style={{
              width: "100%",
              height: "600px",
              border: "1px solid black",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StockChartPage;
