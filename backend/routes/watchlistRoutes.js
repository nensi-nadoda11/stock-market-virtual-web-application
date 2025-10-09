const {addToWatchList,getWatchlist,removeFromWatchlist,clearWatchlist}=require('../controllers/watchListController')
const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')

router.post('/add',auth,addToWatchList)

router.get('/list',auth,getWatchlist)

router.delete('/:id',auth,removeFromWatchlist)

router.delete('/clear',auth,clearWatchlist)

module.exports=router
