const express=require('express')
const {getChartData}=require('../controllers/chartController')
const router=express.Router()

router.get('/:symbol/chart',getChartData)

module.exports=router