import React, { useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const ProfitPrediction = () => {
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    if (!district || !season) {
      setError("Please select both district and season.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPrediction(null);
    setChartData(null);

    try {
      const response = await axios.get(
        `http://localhost:5001/predictprofit?district=${district}&season=${season}`
      );
      setPrediction(response.data);

      // Prepare chart data
      const profitMargin = response.data.estimated_profit_margin;
      const remainingMargin = 100 - profitMargin; // Remaining percentage

      setChartData({
        labels: ["Profit Margin", "Remaining"],
        datasets: [
          {
            label: "Profit Percentage",
            data: [profitMargin, remainingMargin],
            backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      setError("Failed to fetch prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const districts = [
    "Yavatmal", "Pune", "Nashik", "Nagpur", "Solapur", "Kolhapur", "Sangli", "Ahmednagar",
    "Aurangabad", "Amravati", "Wardha", "Jalgaon", "Buldhana", "Chandrapur", "Dhule",
    "Gadchiroli", "Hingoli"
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#112b1c] mb-6">Profit Prediction</h2>

      {/* Input Fields and Predict Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112b1c] focus:border-transparent transition-all"
          >
            <option value="" disabled>Select District</option>
            {districts.map((d, index) => (
              <option key={index} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-grow">
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112b1c] focus:border-transparent transition-all"
          >
            <option value="" disabled>Select Season</option>
            <option value="Rabi">Rabi</option>
            <option value="Kharif">Kharif</option>
          </select>
        </div>
        <button
          onClick={handlePredict}
          disabled={isLoading}
          className="p-3 bg-[#112b1c] text-white rounded-lg hover:bg-[#1b3a28] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Predicting..." : "Predict Profit"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Prediction Result */}
      {prediction && (
        <div className="mb-6 p-6 bg-green-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[#112b1c] mb-2">
            Best Crop for {prediction.district} in {prediction.season}
          </h3>
          <p className="text-lg text-gray-700">
            <strong>Crop:</strong> {prediction.best_crop}
          </p>
          <p className="text-lg text-gray-700">
            <strong>Estimated Profit Margin:</strong>{" "}
            {prediction.estimated_profit_margin > 1000
              ? (prediction.estimated_profit_margin / 100).toFixed(2)
              : prediction.estimated_profit_margin.toFixed(2)}
            %
          </p>
        </div>
      )}

      {/* Doughnut Chart */}
      {chartData && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-[#112b1c] mb-4">
            Profit Margin Breakdown
          </h3>
          <div className="w-64 h-64 mx-auto">
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        return `${label}: ${value}%`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitPrediction;