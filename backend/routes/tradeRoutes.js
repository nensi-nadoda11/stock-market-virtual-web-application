const express=require("express")
const router=express.Router()
const {buyStock,sellStock, getPortfolio, getTransaction, deleteTransaction, deleteAllTransaction, getTransactionsBySymbol, getOrders, modifyPendingOrder}=require("../controllers/tradeController")
const auth=require('../middleware/auth')

router.post("/buy",auth,buyStock)

router.post("/sell",auth,sellStock)

router.get('/portfolio',auth,getPortfolio)

router.get('/transaction',auth,getTransaction)

router.delete('/deletehistory/:id',auth,deleteTransaction)

router.delete('/deleteallhistory',auth,deleteAllTransaction)

router.get("/portfolio/:symbol/transactions", auth, getTransactionsBySymbol);

router.get("/orders",auth,getOrders)

router.put("/orders/:id/modify",auth,modifyPendingOrder)
//router.get("/portfolio/:user",auth,getPortfolio)

//router.get("/transaction/:userId",auth,getTransaction)

module.exports=router