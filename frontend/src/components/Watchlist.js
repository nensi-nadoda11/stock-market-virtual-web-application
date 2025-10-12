import React,{useState,useEffect} from "react";
import axios from "axios";
import { io } from 'socket.io-client';
import '../style/Watchlist.css';
import Navbar from "./Navbar";

// Socket connection
const socket = io('http://localhost:5000', {
  transports:["websocket"]
});

function WatchlistPage(){
  const [watchlist,setWatchlist] = useState([]);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const handleStockUpdate = (updatedStock) => {
      console.log("watchlist event mila:", updatedStock);

      setWatchlist((prev) =>
        prev.map((stock) =>
          stock.stockSymbol.toUpperCase() === updatedStock.stockSymbol.toUpperCase()
            ? {
                ...stock,
                previousPrice: Number(stock.previousPrice || stock.currentPrice),// ✅ old price save
                currentPrice: Number(updatedStock.currentPrice) // ✅ new price set
              }
            : stock
        )
      );
    };

    socket.on("stockUpdated", handleStockUpdate);
    return () => socket.off("stockUpdated", handleStockUpdate);
  }, []);   // ✅ dependency [] ताकि बार-बार listener न लगे

  // Fetch initial watchlist
  useEffect(()=>{
    const fetchWatchlist = async()=>{
      try{
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/watchlist/list', {
          headers:{Authorization:`Bearer ${token}`}
        });
        setWatchlist(res.data.watchlist || []);
        console.log("data of list",res.data.watchlist)
      }
      catch(error){
        console.error("Error fetching watchlist", error);
      }
    }
    fetchWatchlist();
  }, []);

  // Remove single stock
  const removeStock = async(id) => {
    try{
      await axios.delete(`http://localhost:5000/watchlist/${id}`, {
        headers:{Authorization:`Bearer ${token}`}
      });
      setWatchlist((prev)=>prev.filter((stock)=>stock._id !== id));
    }
    catch(error){
      console.error("Error removing stock", error);
    }
  }

  // Clear all watchlist
  const clearWatchlist = async() => {
    try{
      console.log("clear")
      const res=  await axios.delete("http://localhost:5000/watchlist/clear", {
        headers:{Authorization:`Bearer ${token}`}
      });
      console.log("res",res)
      setWatchlist([]);
    }catch(error){
      console.error("Error clearing watchlist:", error.message);
    }
  }

  return(
    <div>
      <Navbar/>
      <div className="watchlist-container">
        <h2>Your Watchlist</h2>

        {watchlist.length === 0 ? (
          <p className="empty-msg">
            Your watchlist is empty
          </p>
        ) : (
          <>
            <table className="watchlist-table">
              <thead>
                <tr>
                  <th>Stock Symbol</th>
                  <th>Current Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
               { watchlist.map((stock) => (
                  <tr key={stock._id}>
                    <td>{stock.stockSymbol}</td>
                    <td
                     className={
                        stock.previousPrice && Number(stock.currentPrice) > Number(stock.previousPrice) ?
                        "price-up" : stock.previousPrice && 
                           Number(stock.currentPrice) < Number(stock.previousPrice) ?"price-down"
                               :""
                      }
                    >
                      ₹{Number(stock.currentPrice).toFixed(2)}
                      {stock.previousPrice && (Number(stock.currentPrice) > Number(stock.previousPrice) ? " ▲" :" ▼")}
                    </td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={()=>removeStock(stock._id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="clear-btn" onClick={clearWatchlist}>Clear All</button>
          </>
        )}
      </div>
    </div>
  );
}

export default WatchlistPage;
