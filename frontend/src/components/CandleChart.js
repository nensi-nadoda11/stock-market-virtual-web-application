import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CandleChart = ({ chartData }) => {
  const chartContainer = useRef(null);

  useEffect(() => {
    if (!chartContainer.current || chartData.length === 0) return;

    // Chart create kare
    const chart = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth || 800,
      height: 500,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
    });

    // ✅ v5 me yeh sahi syntax hai
    const candleSeries = chart.addSeries({
      type: "Candlestick",
      upColor: "#0f0",
      downColor: "#f00",
      borderUpColor: "#0f0",
      borderDownColor: "#f00",
      wickUpColor: "#0f0",
      wickDownColor: "#f00",
    });

    // Data lagao
    candleSeries.setData(
      chartData.map((d) => ({
        time: Math.floor(d.time), // epoch seconds
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    // Resize handle
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
    <div
      ref={chartContainer}
      style={{ width: "100%", height: "500px", border: "1px solid black" }}
    />
  );
};

export default CandleChart;
