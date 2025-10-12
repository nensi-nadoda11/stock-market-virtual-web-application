import { useState } from "react";
import '../style/ApplyIpo.css'

const ApplyIpo=({ipo,onclose})=>{
  const [lotSize,setLotSize]=useState(ipo?.lotSize || 1)
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState("")
  const userId=sessionStorage.getItem("userId")

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try{
       const token=sessionStorage.getItem("token")
       const res=await fetch(`http://localhost:5000/ipo/${ipo._id}/apply`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({userId:userId,ipoId:ipo._id,lots:Number(lotSize)})
       })

       const data=await res.json()
       console.log("dataa:",data)
       if(res.ok)
       {
        setMessage(`${data.message}`)
       }
       else
        setMessage(`${data.message}`)
    }
    catch(error)
    {
       console.log("Error:",error.message)
    }
    finally {
      setLoading(false);
    }
  }
  return(
    <div className="modal-overlay">
      <div className="modal-box">
       <a href="/ipo" ><button className="close-btn"  onClick={onclose}>  ✖ </button></a> 
         <h2 className="modal-title">Apply for {ipo.companyName}</h2>
         <p className="modal-subtitle">
          Price Range:<strong>{ipo.priceRange || `₹${ipo.pricePerShare}`}</strong>
         </p>
         <p className="modal-subtitle">
          Lot Size:<strong>{ipo.lotSize}</strong>
         </p>
         <form onSubmit={handleSubmit} className="apply-form">
          <label>Enter Lots:</label>
          <input
           type="number"
           min={ipo.minLots || 1}
           value={lotSize}
           onChange={(e)=>setLotSize(e.target.value)}
           required
           />

           <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Applying...":"Submit Application"}
           </button>
         </form>
         {message && <p className="response-msg">{message}</p>}
      </div>
    </div>
  )
}
export default ApplyIpo