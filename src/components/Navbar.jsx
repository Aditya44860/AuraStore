import { Link, useLocation } from "react-router-dom";
import SearchBox from "./SearchBox";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

function Navbar() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const { getCartCount, getWishlistCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const handleLogin = () => {
    login({ name: "John Doe", email: "john@example.com" });
    setShowDropdown(false);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-200 via-white to-gray-200 border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-1 sm:px-2">
        <div className="flex items-center h-16 sm:h-20 justify-between">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-black focus:outline-none mr-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <Link to="/" className="flex items-center">
              <img
                src="/final_logo_2.png"
                alt="AuraStore"
                className="h-8 sm:h-11 w-auto"
              />
            </Link>
          </div>

          {/* Center: Navigation routes - desktop only */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link
              to="/upper-wear"
              className={`text-sm font-medium hover:text-black transition uppercase tracking-wide relative ${
                location.pathname === "/upper-wear"
                  ? "text-black transform translate-y-[-2px]"
                  : "text-gray-800"
              }`}
              style={
                location.pathname === "/upper-wear"
                  ? { textShadow: "0 3px 6px rgba(0, 0, 0, 0.3)" }
                  : {}
              }
            >
              UPPER WEAR
            </Link>
            <Link
              to="/bottom-wear"
              className={`text-sm font-medium hover:text-black transition uppercase tracking-wide relative ${
                location.pathname === "/bottom-wear"
                  ? "text-black transform translate-y-[-2px]"
                  : "text-gray-800"
              }`}
              style={
                location.pathname === "/bottom-wear"
                  ? { textShadow: "0 3px 6px rgba(0, 0, 0, 0.3)" }
                  : {}
              }
            >
              BOTTOM WEAR
            </Link>
            <Link
              to="/sneakers"
              className={`text-sm font-medium hover:text-black transition uppercase tracking-wide relative ${
                location.pathname === "/sneakers"
                  ? "text-black transform translate-y-[-2px]"
                  : "text-gray-800"
              }`}
              style={
                location.pathname === "/sneakers"
                  ? { textShadow: "0 3px 6px rgba(0, 0, 0, 0.3)" }
                  : {}
              }
            >
              SNEAKERS
            </Link>
            <Link
              to="/sale"
              className={`text-sm font-medium hover:text-red-700 transition uppercase tracking-wide relative ${
                location.pathname === "/sale"
                  ? "text-red-700 transform translate-y-[-2px]"
                  : "text-red-600"
              }`}
              style={
                location.pathname === "/sale"
                  ? { textShadow: "0 3px 6px rgba(220, 38, 38, 0.4)" }
                  : {}
              }
            >
              SALE
            </Link>
            <Link
              to="/all-products"
              className={`text-sm font-medium hover:text-black transition uppercase tracking-wide relative ${
                location.pathname === "/all-products"
                  ? "text-black transform translate-y-[-2px]"
                  : "text-gray-800"
              }`}
              style={
                location.pathname === "/all-products"
                  ? { textShadow: "0 3px 6px rgba(0, 0, 0, 0.3)" }
                  : {}
              }
            >
              ALL PRODUCTS
            </Link>
          </div>

          {/* Right: Search + Icons */}
          <div className="flex items-center space-x-3">
            {/* Search - full bar on desktop, icon on mobile */}
            <div className="hidden lg:flex">
              <SearchBox />
            </div>
            <button className="lg:hidden p-2 text-gray-700 hover:text-black transition">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Account Icon with dropdown */}
            <div className="relative">
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="p-2 text-gray-700 hover:text-black transition"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 text-gray-700 hover:text-black transition"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-300 z-50 animate-fade-in"
                      style={{
                        boxShadow:
                          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="text-center mb-4">
                          <h3 className="text-sm sm:text-base font-bold text-black mb-1">
                            ACCOUNT
                          </h3>
                          <div className="w-8 h-0.5 bg-black mx-auto"></div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          <div className="flex-1 text-center">
                            <p className="text-xs text-gray-500 mb-2">
                              Member?
                            </p>
                            <Link
                              to="/login"
                              onClick={() => setShowDropdown(false)}
                              className="w-full bg-black text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center"
                            >
                              Login
                            </Link>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-xs text-gray-500 mb-2">
                              New here?
                            </p>
                            <Link
                              to="/signup"
                              onClick={() => setShowDropdown(false)}
                              className="w-full bg-white text-black border border-gray-300 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 hover:border-black transition-all duration-200 flex items-center justify-center"
                            >
                              Sign Up
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <style jsx>{`
                    @keyframes fade-in {
                      from {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                    .animate-fade-in {
                      animation: fade-in 0.3s ease-out forwards;
                    }
                  `}</style>
                </>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-700 hover:text-black transition relative"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 text-gray-700 hover:text-black transition relative"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {cartCount}
                </span>
              )}
            </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMobileMenu(false)}
            ></div>

            {/* Slide-in menu */}
            <div className="fixed top-0 left-0 h-full w-[70%] bg-white z-50 transform transition-transform duration-300 ease-in-out">
              {/* Close button */}
              <button
                onClick={() => setShowMobileMenu(false)}
                className="absolute top-4 right-4 p-2 text-gray-700 hover:text-black transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-6 pt-20">
                <div className="space-y-6">
                  <Link
                    to="/upper-wear"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-medium hover:text-black transition uppercase tracking-wide ${
                      location.pathname === "/upper-wear"
                        ? "text-black"
                        : "text-gray-800"
                    }`}
                  >
                    UPPER WEAR
                  </Link>
                  <Link
                    to="/bottom-wear"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-medium hover:text-black transition uppercase tracking-wide ${
                      location.pathname === "/bottom-wear"
                        ? "text-black"
                        : "text-gray-800"
                    }`}
                  >
                    BOTTOM WEAR
                  </Link>
                  <Link
                    to="/sneakers"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-medium hover:text-black transition uppercase tracking-wide ${
                      location.pathname === "/sneakers"
                        ? "text-black"
                        : "text-gray-800"
                    }`}
                  >
                    SNEAKERS
                  </Link>
                  <Link
                    to="/sale"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-medium hover:text-red-700 transition uppercase tracking-wide ${
                      location.pathname === "/sale"
                        ? "text-red-700"
                        : "text-red-600"
                    }`}
                  >
                    SALE
                  </Link>
                  <Link
                    to="/all-products"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-medium hover:text-black transition uppercase tracking-wide ${
                      location.pathname === "/all-products"
                        ? "text-black"
                        : "text-gray-800"
                    }`}
                  >
                    ALL PRODUCTS
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
