import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";

function Navbar() {
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
