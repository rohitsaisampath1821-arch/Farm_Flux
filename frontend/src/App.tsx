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
     
      </Routes>
    </BrowserRouter>
  );
}

export default App;