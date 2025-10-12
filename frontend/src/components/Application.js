import {useEffect,useState} from 'react'
import '../style/Application.css'

const Application=({onClose})=>{
  const [application,setApplication]=useState([])
  const [loading,setLoading]=useState(true)
  const userId=sessionStorage.getItem('userId')

  useEffect(()=>{
    const fetchApplication=async()=>{
      try{
         const token=sessionStorage.getItem('token')
         const res=await fetch(`http://localhost:5000/ipo/ipoApplication/${userId}`,{
          headers:{Authorization:`Bearer ${token}`}
         })

         const data=await res.json()
         if(res.ok)
         {
           setApplication(data.data||[])
         }
         else
         {
          console.error("Error fetching application",data.suceess)
         }
      }catch(error)
      {
           console.error("fetch error",error.message)
      }
      finally{
        setLoading(false)
      }
    }
      fetchApplication()
  },[userId])
  return (
    <div className='modal-overlay'>
      <div className='modal-box applications-box'>
        <button className='close-btn' onClick={onClose}>✖</button>
        <h2 className='modal-title'>My Ipo Application</h2>
        {loading ?(
          <p>Loading Application...</p>
        ):application.length===0?(
          <p>No Application Found.</p>
        ):(
          <table className='applications-table'>
               <thead>
                <tr>
                  <th>Company</th>
                  <th>Lots Applied</th>
                  <th>Shares</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Applied At</th>
                </tr>
               </thead>
               <tbody>
                {application.map(app=>(
                  <tr key={app._id}>
                    <td>{app.ipoId?.companyName || "N/A"}</td>
                    <td>{app.lotsApplied}</td>
                    <td>{app.sharesRequested}</td>
                    <td>{app.amountBlocked}</td>
                    <td className={`status ${app.status}`}>{app.status}</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
               </tbody>
          </table>
        )

        }
      </div>
    </div>
  )
}
export default Application