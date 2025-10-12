import Register from './components/Register'
import OtpVerify from './components/OtpVerify'
import React from 'react';
import {BrowserRouter as Router ,Routes,Route} from 'react-router-dom'
import KycVerify from './components/KycVerify';
import KycOtpVerify from './components/KycOtpVerify';
import Detail from './components/Detail';
import Login from './components/Login';
import LoginOtpVerify from './components/LoginOtpVerify';
import Home from './components/Home';
import Ipo from './components/Ipo';
import StockChartPage from './components/StockChart'
import Portfolio from './components/Portfolio'
import Transactions from './components/Transaction';
import WatchlistPage from './components/Watchlist';
import Profile from './components/Profile';
import { ThemeProvider } from './components/Theme';
import OrdersPage from './components/OrderPage';


function App() {
  return (
    <ThemeProvider> 
 <Router>
  <Routes>
    <Route path='/register' element={<Register/>}/>
    <Route path='/otp' element={<OtpVerify/>}/>
    <Route path='/kyc-verify' element={<KycVerify/>}/>
    <Route path='/kyc-otp-verify' element={<KycOtpVerify/>}/>
    <Route path='/detail' element={<Detail/>}/>
    <Route path='/' element={<Login/>}/>
    <Route path='/login-otp-verify' element={<LoginOtpVerify/>}/>
    <Route path='/home' element={<Home/>}/>
    <Route path='/ipo' element={<Ipo/>}/>
    <Route path="/chart/:symbol" element={<StockChartPage/>}/>
    <Route path="/portfolio/" element={<Portfolio/>}/>
    <Route path='/transaction/' element={<Transactions/>}/>
    <Route path="/watchlist" element={<WatchlistPage/>}/>
    <Route path='/profile' element={<Profile/>}/>
    <Route path="/orders" element={<OrdersPage/>}/>
    
  </Routes>
 </Router>
 </ThemeProvider>
  );
}

export default App;
