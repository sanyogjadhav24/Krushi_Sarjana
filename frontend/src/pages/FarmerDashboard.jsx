import React, { useState, useEffect } from "react";
import { Switch } from "../components/ui/Switch.jsx";
import PriceComparison from "../components/ui/PriceComparison.jsx";
import PricePrediction from "../components/ui/PricePrediction.jsx";
import ProfitPrediction from "../components/ui/ProfitPrediction.jsx";
import { FaBell, FaChartLine, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { MdOutlineAnalytics, MdCategory, MdUpload } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/api.js";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPricePrediction, setShowPricePrediction] = useState(true); // State for Price Prediction switch
  const [showProfitPrediction, setShowProfitPrediction] = useState(true); // State for Profit Prediction switch
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        if (!decoded.id) return console.error("User ID not found in token");

        const userData = await AuthAPI.getUserById(decoded.id);
        setUser(userData);
      } catch (error) {
        console.error(error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex h-screen bg-[#f3f3f3] text-gray-900">
      {/* Sidebar - Adapts to sm & md devices */}
      <div
        className={`fixed md:relative z-50 md:w-1/4 h-screen md:h-auto bg-[#112b1c] p-6 text-white flex flex-col transition-all duration-300 
        ${isSidebarOpen ? "left-0 w-3/4 sm:w-2/4" : "-left-full"} md:left-0 md:flex`}
      >
        {/* Close Button for Mobile */}
        <button
          className="absolute top-4 right-4 text-white text-2xl md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center md:justify-start mt-4 mb-6">
          {user ? (
            user.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-12 h-12 rounded-full shadow-md"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-500 text-white rounded-full shadow-md text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-gray-500 text-white rounded-full shadow-md">
              Loading...
            </div>
          )}
          <span className="text-2xl font-bold ml-3">🌿 KrishiSarjana</span>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 mb-6">
          <button
            className="flex flex-col md:flex-row items-center md:justify-start md:gap-3 p-4 bg-[#1b3a28] rounded-lg hover:bg-[#21503a] transition-all"
            onClick={() => navigate("/marketplace")}
          >
            <MdCategory className="text-orange-400 text-2xl" />
            <span className="text-sm text-gray-300 mt-1 md:mt-0">Marketplace</span>
          </button>

          <button
            className="flex flex-col md:flex-row items-center md:justify-start md:gap-3 p-4 bg-[#1b3a28] rounded-lg hover:bg-[#21503a] transition-all"
            onClick={() => navigate("/MyFarmerPro")}
          >
            <MdUpload className="text-green-400 text-2xl" />
            <span className="text-sm text-gray-300 mt-1 md:mt-0">Upload Products</span>
          </button>

          <button
            className="flex flex-col md:flex-row items-center md:justify-start md:gap-3 p-4 bg-[#1b3a28] rounded-lg hover:bg-[#21503a] transition-all"
            onClick={() => navigate("/FarmerOrder")}
          >
            <FaShoppingCart className="text-red-400 text-2xl" />
            <span className="text-sm text-gray-300 mt-1 md:mt-0">Orders</span>
          </button>
        </div>

        {/* Switch Controls */}
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-300">
              <MdOutlineAnalytics /> Price Prediction
            </span>
            <Switch
              defaultChecked={showPricePrediction}
              onChange={(checked) => setShowPricePrediction(checked)}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-300">
              <FaChartLine /> Profit Prediction
            </span>
            <Switch
              defaultChecked={showProfitPrediction}
              onChange={(checked) => setShowProfitPrediction(checked)}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="mt-10">
          <div className="space-y-3">
            <button className="flex items-center gap-3 w-full p-3 bg-[#1b3a28] rounded-lg transition hover:bg-[#21503a]" 
            onClick={() => navigate("/AlertPage")}>
              <FaBell className="text-lg" /> Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button (only for small devices) */}
      <button
        className="fixed top-4 left-4 md:hidden text-2xl bg-[#112b1c] text-white p-2 rounded-lg"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FaBars />
      </button>

      {/* Main Content - Responsive Layout */}
      <div className="w-full md:w-3/4 h-screen p-6 overflow-auto">
        {/* Price Prediction Chart */}
        {showPricePrediction && (
          <div className="mt-6">
            <PricePrediction />
          </div>
        )}

        {/* Profit Prediction & Price Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {showProfitPrediction && <ProfitPrediction />}
          <PriceComparison />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;