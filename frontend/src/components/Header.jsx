import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Search from "./Search.jsx";
import { BsCart4 } from "react-icons/bs";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import axios from "axios";
import UserMenu from "./UserMenu.jsx";
import { IoMdNotificationsOutline } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import Divider from "./Divider.jsx";
import { AuthAPI, API } from "../api/api.js";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const [openCartSection, setOpenCartSection] = useState(false);
  const [user, setUser] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [cartItem, setCartItem] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    "Welcome to Krushi Sarjana!",
  ]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleOrderPlacement = (paymentMethod) => {
    const notificationMessage = user?.role === "farmer"
      ? "Order Received"
      : "Order Completed";

    setNotifications((prevNotifications) => [
      ...prevNotifications,
      `Payment Method: ${paymentMethod} - ${notificationMessage}`,
    ]);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        if (!decoded.id) {
          console.error("User ID not found in token");
          return;
        }

        const userData = await AuthAPI.getUserById(decoded.id);
        setUser(userData);
      } catch (error) {
        console.error(error);
        setUser(null);
      }
    };

    fetchUser();
  }, [user]);

  return (
    <header className="bg-white shadow-md py-4 px-16">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Left Group: Logo, Heading, and Search Bar */}
        <div className="flex items-center gap-8">
          {/* Logo and Heading */}
          <div className="flex items-center">
            <img src="/images/krushilogo.png" alt="" className="h-10 mr-3" />
            <a href="/">
              <h1 className="text-2xl font-bold text-green-600 whitespace-nowrap">
                Krishi Sarjana
              </h1>
            </a>
          </div>
          {/* Search Bar */}
          {/* <div className="max-w-sm">
            <Search />
          </div> */}
        </div>

        {/* Right Group: Account/Login, Notification, and Kinesis */}
        <div className="flex items-center gap-6">
          {/* Account/Login */}
          {user?._id ? (
            <div className="relative">
              <div
                onClick={() => setOpenUserMenu((prev) => !prev)}
                className="flex items-center gap-1 cursor-pointer"
              >
                <p>Account</p>
                {openUserMenu ? (
                  <GoTriangleUp size={25} />
                ) : (
                  <GoTriangleDown size={25} />
                )}
              </div>
              {openUserMenu && (
                <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg z-50 w-48">
                  <UserMenu close={() => setOpenUserMenu(false)} user={user} />
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="text-lg px-2">
              Login
            </button>
          )}
      <button onClick={toggleDropdown} className="text-xl relative z-50 mr-4">
    <IoMdNotificationsOutline size={30} />
  </button>
      <p className="ml-auto ">Kinesis</p>

          {/* Notification Icon */}
          <div className="relative ml-2">
 
            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 w-64 mt-2 bg-white border rounded-lg shadow-lg p-4 z-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <button onClick={clearNotifications} className="text-sm text-red-500">
                    <AiOutlineClose />
                  </button>
                </div>
                <div className="mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={index} className="border-b py-2 text-sm text-gray-700">
                        {notification}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

         
        </div>
      </div>

      {/* Cart Sidebar */}
      {openCartSection && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transition-transform transform translate-x-0">
          <button
            onClick={() => setOpenCartSection(false)}
            className="absolute top-2 right-3 text-2xl"
          >
            &times;
          </button>
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
            {cartItem.length > 0 ? (
              cartItem.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center py-2"
                >
                  <p>{item.productId.name}</p>
                  <p>
                    <button
                      className="px-2"
                      onClick={() => ""}
                    >
                      -
                    </button>
                    {item.quantity}
                    <button
                      className="px-2"
                      onClick={() => ""}
                    >
                      +
                    </button>
                  </p>
                  <p>
                    {/* Display Price Here */}
                  </p>
                </div>
              ))
            ) : (
              <p>No items in the cart</p>
            )}

            {/* Summary and Bill details - Dropdown */}
            <div className="mt-6">
              <div
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                className="cursor-pointer flex justify-between items-center py-2 font-semibold text-lg"
              >
                <p>Summary</p>
                {isSummaryOpen ? <GoTriangleUp /> : <GoTriangleDown />}
              </div>
              {isSummaryOpen && (
                <div className="mt-2">
                  <div className="flex justify-between py-2">
                    <p>Products Cost</p>
                    {/* Display Price Here */}
                  </div>
                  <div className="flex justify-between py-2">
                    <p>Total Items</p>
                    <p>{totalQty}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p>Delivery Cost</p>
                    {/* Display Price Here */}
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <p>Total Cost</p>
                    {/* Display Price Here */}
                  </div>
                  <Divider />
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <p>Farmers Growth Fund</p>
                    {/* Display Price Here */}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="mt-6 flex flex-col gap-4">
              <button
                onClick={() => {
                  handleOrderPlacement("Online Payment");
                  navigate("/checkout");
                }}
                className="bg-green-700 text-white py-2 px-4 rounded w-full"
              >
                Online Payment
              </button>
              <button
                onClick={() => {
                  handleOrderPlacement("Cash on Delivery");
                  navigate("/checkout");
                }}
                className="bg-green-700 text-white py-2 px-4 rounded w-full"
              >
                Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;