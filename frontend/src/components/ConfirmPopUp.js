import '../style/Transaction.css'
function ConfirmPopUp({onConfirm,onCancel}){
  return (
    <div className='popup-overlay'>
      <div className='popup-card'>
        <p>Are you sure you want to delete ?</p>
        <div className='popup-action'>
          <button className='popup-yes' onClick={onConfirm}>Yes</button>
          <button className='popup-no' onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmPopUp