import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const { isLoggedIn, user, login, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogin = () => {
    login({ name: 'John Doe', email: 'john@example.com' })
    setShowDropdown(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <img
              src="/final_logo_2.png"
              alt="AuraStore"
              className="h-11 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-10">
            <Link
              to="/upper-wear"
              className="text-sm font-medium text-gray-800 hover:text-black transition uppercase tracking-wide"
            >
              UPPER WEAR
            </Link>
            <Link
              to="/bottom-wear"
              className="text-sm font-medium text-gray-800 hover:text-black transition uppercase tracking-wide"
            >
              BOTTOM WEAR
            </Link>
            <Link
              to="/sneakers"
              className="text-sm font-medium text-gray-800 hover:text-black transition uppercase tracking-wide"
            >
              SNEAKERS
            </Link>
            <Link
              to="/sale"
              className="text-sm font-medium text-red-600 hover:text-red-700 transition uppercase tracking-wide"
            >
              SALE
            </Link>
            <Link
              to="/all-products"
              className="text-sm font-medium text-gray-800 hover:text-black transition uppercase tracking-wide"
            >
              ALL PRODUCTS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBox />
            <div className="flex items-center space-x-3">
              <div className="relative">
                {isLoggedIn ? (
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-black transition p-1"
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
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="text-gray-700 hover:text-black transition p-1"
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
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-300 z-50 animate-in fade-in duration-300 opacity-0 animate-fade-in" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'}}>
                        <div className="p-5">
                          <div className="text-center mb-4">
                            <h3 className="text-base font-bold text-black mb-1">ACCOUNT</h3>
                            <div className="w-8 h-0.5 bg-black mx-auto"></div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="flex-1 text-center">
                              <p className="text-xs text-gray-500 mb-2 text-center">Member?</p>
                              <Link
                                to="/login"
                                onClick={() => setShowDropdown(false)}
                                className="w-full bg-black text-white py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                              >
                                Login
                              </Link>
                            </div>
                            
                            <div className="flex-1 text-center">
                              <p className="text-xs text-gray-500 mb-2 text-center">New here?</p>
                              <Link
                                to="/signup"
                                onClick={() => setShowDropdown(false)}
                                className="w-full bg-white text-black border border-gray-300 py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-black transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
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
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                      .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                      }
                    `}</style>
                  </>
                )}
              </div>
              <Link
                to="/wishlist"
                className="text-gray-700 hover:text-black transition relative p-1"
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
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  2
                </span>
              </Link>
              <Link
                to="/cart"
                className="text-gray-700 hover:text-black transition relative p-1"
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
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
