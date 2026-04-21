import { Link, useLocation } from "react-router-dom";
import SearchBox from "./SearchBox";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useChat } from "../context/ChatContext";
import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";

function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const { getCartCount, getWishlistCount } = useCart();
  const { toggleChat } = useChat();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileSearchRef = useRef(null);
  const location = useLocation();

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic navbar classes based on page and scroll
  const isTransparent = isHome && !scrolled;

  const navClasses = isTransparent
    ? "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] bg-transparent border-b border-transparent"
    : "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] border-b border-white/20";

  // Apple liquid glass style — only when scrolled or on non-home pages
  const navStyle = isTransparent
    ? {}
    : {
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(40px) saturate(200%) brightness(1.05)",
        WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.05)",
      };

  const linkColor = isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const linkActiveColor = isTransparent ? "text-white" : "text-gray-900";
  const iconColor = isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const saleColor = isTransparent ? "text-red-300 hover:text-red-200" : "text-red-500 hover:text-red-600";
  const saleActiveColor = isTransparent ? "text-red-200" : "text-red-600";

  return (
    <nav className={navClasses} style={navStyle}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center h-16 sm:h-20 justify-between">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-md focus:outline-none mr-2 transition-colors duration-300 ${iconColor}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <Link to="/" className="flex items-center lg:mr-0">
              <img
                src="/final_logo_2.png"
                alt="AuraStore"
                className={`h-8 sm:h-10 w-auto transition-all duration-500 ${isTransparent ? "brightness-0 invert" : ""
                  }`}
              />
            </Link>
          </div>

          {/* Center: Navigation on desktop */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link
              to="/upper-wear"
              className={`text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${location.pathname === "/upper-wear" ? linkActiveColor : linkColor
                }`}
            >
              Upper Wear
            </Link>
            <Link
              to="/bottom-wear"
              className={`text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${location.pathname === "/bottom-wear" ? linkActiveColor : linkColor
                }`}
            >
              Bottom Wear
            </Link>
            <Link
              to="/sneakers"
              className={`text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${location.pathname === "/sneakers" ? linkActiveColor : linkColor
                }`}
            >
              Sneakers
            </Link>
            <Link
              to="/sale"
              className={`text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${location.pathname === "/sale" ? saleActiveColor : saleColor
                }`}
            >
              Sale
            </Link>
            <Link
              to="/all-products"
              className={`text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${location.pathname === "/all-products" ? linkActiveColor : linkColor
                }`}
            >
              All Products
            </Link>
          </div>

          {/* Right: Search + Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search - desktop only */}
            <div className="hidden lg:flex">
              <SearchBox isTransparent={isTransparent} />
            </div>
            <button
              onClick={() => setShowMobileSearch(true)}
              className={`lg:hidden p-2 transition-colors duration-300 ${iconColor}`}
            >
              <svg
                className="w-5 h-5"
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
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Account Icon with dropdown */}
              <div className="relative">
                {isLoggedIn ? (
                  <Link
                    to="/profile"
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-normal transition-all duration-300 ${isTransparent
                        ? "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                      }`}
                    title={user?.name}
                  >
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className={`p-2 transition-colors duration-300 ${iconColor}`}
                    >
                      <svg
                        className="w-5 h-5"
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
                        className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 animate-fade-in"
                        style={{
                          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="p-5">
                          <div className="text-center mb-4">
                            <h3 className="text-xs font-normal text-gray-900 mb-1 uppercase tracking-[0.15em]">
                              Account
                            </h3>
                            <div className="w-6 h-[0.5px] bg-gray-300 mx-auto" />
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1 text-center">
                              <p className="text-[10px] text-gray-400 mb-2 font-light">
                                Member?
                              </p>
                              <Link
                                to="/login"
                                onClick={() => setShowDropdown(false)}
                                className="w-full bg-gray-900 text-white py-2.5 px-3 rounded-xl text-xs font-light hover:bg-gray-700 transition-all duration-300 flex items-center justify-center tracking-wide"
                              >
                                Login
                              </Link>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-[10px] text-gray-400 mb-2 font-light">
                                New here?
                              </p>
                              <Link
                                to="/signup"
                                onClick={() => setShowDropdown(false)}
                                className="w-full bg-white text-gray-900 border border-gray-200 py-2.5 px-3 rounded-xl text-xs font-light hover:bg-gray-50 hover:border-gray-900 transition-all duration-300 flex items-center justify-center tracking-wide"
                              >
                                Sign Up
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className={`p-2 transition-colors duration-300 relative ${iconColor}`}
              >
                <svg
                  className="w-5 h-5"
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
                  <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-light">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className={`p-2 transition-colors duration-300 relative ${iconColor}`}
              >
                <svg
                  className="w-5 h-5"
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
                  <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-light">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* Chat Icon */}
              <button
                onClick={toggleChat}
                className={`p-2 transition-colors duration-300 relative ${iconColor}`}
                title="Customer Support"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showMobileSearch && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowMobileSearch(false)}
            />
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50" ref={mobileSearchRef}>
              <SearchBox onSearchSubmit={() => setShowMobileSearch(false)} autoFocus={true} />
            </div>
          </>
        )}

        {/* Mobile menu overlay */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Slide-in menu */}
            <div className="fixed top-0 left-0 h-full w-[75%] max-w-[320px] bg-white/95 backdrop-blur-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
              {/* Close button */}
              <button
                onClick={() => setShowMobileMenu(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 transition-colors duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-8 pt-24">
                <div className="space-y-8">
                  <Link
                    to="/upper-wear"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-light tracking-wide transition-colors duration-300 ${location.pathname === "/upper-wear"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                      }`}
                  >
                    Upper Wear
                  </Link>
                  <Link
                    to="/bottom-wear"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-light tracking-wide transition-colors duration-300 ${location.pathname === "/bottom-wear"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                      }`}
                  >
                    Bottom Wear
                  </Link>
                  <Link
                    to="/sneakers"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-light tracking-wide transition-colors duration-300 ${location.pathname === "/sneakers"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                      }`}
                  >
                    Sneakers
                  </Link>
                  <Link
                    to="/sale"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-light tracking-wide transition-colors duration-300 ${location.pathname === "/sale"
                        ? "text-red-500"
                        : "text-red-400 hover:text-red-500"
                      }`}
                  >
                    Sale
                  </Link>
                  <Link
                    to="/all-products"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block text-lg font-light tracking-wide transition-colors duration-300 ${location.pathname === "/all-products"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                      }`}
                  >
                    All Products
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
