import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthAPI } from "../../api/api.js";
import { createOrder } from "../../api/order.js"; // Import order API

const stripePromise = loadStripe("pk_test_51Qg4d8COGtoPg0AAXfp8EteNtlUBmr2dptKAGM9BffWe5AylTauBGE78u7VMrQ9JaPXILTjJcXa7DJOiqDCkP6xm00aXHPctf7");

const AddToCart = ({ id, image, name, price, category, description, onClose, sellerId, sellerName, sellerRole }) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState("logistic");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in");
          return;
        }

        let decoded;
        try {
          decoded = jwtDecode(token);
        } catch (decodeError) {
          setError("Invalid token");
          return;
        }

        if (!decoded.id) {
          setError("User ID not found in token");
          return;
        }

        const userData = await AuthAPI.getUserById(decoded.id);
        if (!userData) {
          setError("User data not found.");
          return;
        }

        setUser(userData);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch user data.");
      }
    };

    fetchUser();
  }, []);

  const calculateSubtotal = () => {
    const basePrice = price * quantity;
    const deliveryCharge = deliveryType === "logistic" ? 50 : 0; // Delivery charge only for logistic
    return basePrice + deliveryCharge;
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("User not logged in!");
      return;
    }

    

    try {

      const orderData = {
        orderId: `ORD-${Date.now()}`,
        buyerId: user._id,  // Change 'buyer' to 'buyerId'
        productId: id,  // Change 'product' to 'productId'
        paymentId: "STRIPE_UI_ONLY",
        paymentStatus: "Pending",
        subTotalAmount: calculateSubtotal(),
        totalAmount: calculateSubtotal(),
        invoiceReceipt: "",
        orderStatus: "Pending",
      };
      
      console.log("Order Data Prepared: ", orderData);
      console.log("Sending order data to backend...");
      
      try {
        const orderResponse = await axios.post(
          "http://localhost:5000/api/orders/create-order",
          orderData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      
        console.log("Order Response:", orderResponse.data);
      
        if (orderResponse.status !== 201) {
          toast.error("Failed to create order!");
          return;
        }
      } catch (error) {
        console.error("Order Creation Error:", error.response?.data || error.message);
        toast.error("Something went wrong!");
      }      

      const stripe = await stripePromise;

      // ✅ Call Backend to Create Checkout Session
      const { data } = await axios.post("http://localhost:5000/api/orders/checkout", {
        items: [{ name, price, image, quantity }],
        userId: user._id,
      });

      if (!data.sessionId) {
        toast.error("Failed to create checkout session!");
        return;
      }

      // ✅ Redirect User to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      // ✅ After Successful Payment, Save Order in Database
      // await createOrder({
      //   orderId: `ORD-${Date.now()}`,
      //   buyerId: user._id,  // Change 'buyer' to 'buyerId'
      //   productId: id,  // Change 'product' to 'productId'
      //   paymentId: "STRIPE_UI_ONLY",
      //   paymentStatus: "Pending",
      //   subTotalAmount: calculateSubtotal(),
      //   totalAmount: calculateSubtotal(),
      //   invoiceReceipt: "",
      //   orderStatus: "Pending",
      // });

      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed!");
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 border-2 border-black relative">
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500" onClick={onClose}>
          <FaTimes size={20} />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="w-full md:w-1/3">
            <div className="w-48 h-48 bg-gray-300 rounded-lg mx-auto overflow-hidden">
              {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-2/3">
            <h3 className="text-2xl font-semibold">{name}</h3>
            <p className="text-lg text-gray-700 font-semibold">₹{price}</p>
            <p className="text-sm text-gray-500 italic">{category}</p>
            <p className="text-gray-600 mt-3">{description}</p>

            {/* Quantity Input */}
            <div className="mt-4">
              <label className="block text-gray-700">Quantity:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 p-2 border rounded-lg"
              />
            </div>

            {/* Delivery Type Selection */}
            <div className="mt-4">
              <label className="block text-gray-700">Delivery Type:</label>
              <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} className="w-full p-2 border rounded-lg">
                <option value="logistic">Logistic Partner</option>
                <option value="self">Self Pickup</option>
              </select>
            </div>

            {/* Subtotal & Payment */}
            <div className="mt-6">
              <p className="text-xl font-bold">Subtotal: ₹{calculateSubtotal()}</p>
            </div>

            {/* Order Button */}
            <button
              onClick={handlePayment}
              className="w-full bg-[#112b1c] text-white py-2 mt-5 flex items-center justify-center gap-2 rounded-lg hover:bg-[#0d2015] transition"
            >
              Pay Now
            </button>

            {/* Display Error */}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCart;
