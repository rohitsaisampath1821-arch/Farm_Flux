import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Products from "./pages/Products";
import Farmers from "./pages/Farmers";
import KisanBot from "./pages/KisanBot";
import Complaints from "./pages/Complaints";
import Cart from "./pages/Cart";
import MyPurchases from "./pages/MyPurchases";
import MarketInsights from "./pages/MarketInsights";
import AdminProducts from "./pages/AdminProducts";
import Buyers from "./pages/Buyers";
import BuyerSignup from "./pages/BuyerSignup";
import Orders from "./pages/Orders";
import Forecast from "./pages/Forecast";
import MandiPrices from "./pages/MandiPrices";
import ReceiveComplaints from "./pages/ReceiveComplaints";
import ProfitImpact from "./pages/ProfitImpact";
import Logistics from "./pages/Logistics";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />

        <Route path="/products" element={<Products />} />
        <Route path="/admin-products" element={<AdminProducts />} />
        <Route path="/farmers" element={<Farmers />} />

        <Route path="/kisan-bot" element={<KisanBot />} />
        <Route path="/complaints" element={<Complaints />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/my-purchases" element={<MyPurchases />} />

        <Route
          path="/market-insights"
          element={<MarketInsights />}
        />
      <Route path="/buyers" element={<Buyers />} />

      <Route
  path="/buyer/signup"
  element={<BuyerSignup />}
/>
   <Route path="/orders" element={<Orders />} />

    <Route path="/forecast" element={<Forecast />} />

    <Route
  path="/mandi-prices"
  element={<MandiPrices />}
/>
  <Route
  path="/receive-complaints"
  element={<ReceiveComplaints />}
/>

<Route path="/profit-impact" element={<ProfitImpact />} />
<Route path="/logistics" element={<Logistics />} />
     
      </Routes>
    </BrowserRouter>
  );
}

export default App;