const express=require('express')
const cors=require('cors')
const dotenv=require('dotenv')
const connectDb=require('./config/db')
const config=require('./config/config')
const morgan =require("morgan");
const authRoutes = require("./routes/authRoutes");
const kycRoutes=require('./routes/kycRoutes')
const homeRoutes=require('./routes/homeRoutes')
const fileUpload=require('express-fileupload')
const fetchStockData=require('./services/fetchStock')
const fetchIndice=require('./services/fetchIndice')
const ipoRoutes=require('./routes/ipoRoutes')
const chartRoutes=require('./routes/chartRouter')
const fetchAndStoresIpo=require('./services/fetchIpo')
const {processAllocation}=require('./services/allocateIpo')
const Ipo=require('./models/Ipo')
const cron = require("node-cron");
const tradeRoutes=require('./routes/tradeRoutes')
const userRoutes=require('./routes/userRoutes')
const http=require('http')
const {Server}=require("socket.io")
const watchlistRoutes=require('./routes/watchlistRoutes')
const liveStockServices = require('./services/liveStockService')
const socket=require('./services/socket_io')


const app=express()
dotenv.config()
 connectDb()
app.use(fileUpload({
    useTempFiles: true,       // temp files ka use karega
    tempFileDir: '/tmp/'      // temp directory
}));

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }));
 app.use(morgan("dev"));


app.use('/api',authRoutes)
app.use('/kyc',kycRoutes)
app.use('/stock',homeRoutes)
app.use('/ipo',ipoRoutes)
app.use('/stockchart',chartRoutes)
app.use('/trade',tradeRoutes)
app.use('/watchlist',watchlistRoutes)
app.use('/profile',userRoutes)
console.log("authRoutes:", authRoutes);
console.log("kycRoutes:", kycRoutes);
console.log("homeRoutes:", homeRoutes);
console.log("ipoRoutes:", ipoRoutes);

const server = http.createServer(app);

/*const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});*/
const io=socket.init(server)
liveStockServices(io)


//(async ()=>{await fetchAndStoresIpo()})()
const PORT=config.port||3000;
server.listen(PORT,()=>{
  console.log(`server running on http://localhost:${PORT}`)
})
/*fetchIndice()
fetchStockData()

cron.schedule("1 9-15 * * 1-5", () => {
  fetchIndice();
  fetchStockData();
});
cron.schedule("0 6 * * *", async () => {
  console.log("Cron: fetching IPOs...");
  await fetchAndStoresIpo();
});
cron.schedule("0 18 * * *", async () => {
  console.log("Cron: running allocation for closed IPOs...");
  const closed = await Ipo.find({ offerEndDate: { $lt: new Date() }, status: { $in: ["open","closed"] } });
  for (const ipo of closed) {
    console.log("Allocating for IPO:", ipo.companyName);
    await processAllocation(ipo._id);
  }
});*/