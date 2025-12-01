import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SearchBox() {
  const baseTexts = [
    "T-Shirts",
    "Hoodies",
    "Jeans",
    "Sneakers",
    "Jackets",
    "Shorts",
  ];
  const searchTexts = [...baseTexts, ...baseTexts]; // duplicated for smooth loop
  const [index, setIndex] = useState(0);
  const [transition, setTransition] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`);
        const data = await response.json();
        if (data.success) {
          setAllProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (index === baseTexts.length) {
      setTimeout(() => {
        setTransition(false);
        setIndex(0);
      }, 500);
      setTimeout(() => {
        setTransition(true);
      }, 600);
    }
  }, [index, baseTexts.length]);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.category?.name.toLowerCase().includes(searchTerm) ||
      product.subcategory?.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
    
    setSearchResults(filtered);
    setShowResults(true);
  }, [inputValue, allProducts]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setInputValue("");
    setShowResults(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full sm:w-64 lg:w-72" ref={dropdownRef}>
      <div className="relative flex items-center bg-gray-100 rounded-full px-3 sm:px-4 py-2 shadow-sm">
      <svg
        className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <div className="relative flex-1 overflow-hidden h-5" ref={containerRef}>
        {!isFocused && inputValue === "" && (
          <div
            className={`flex flex-col ${
              transition ? "transition-transform duration-500 ease-in-out" : ""
            }`}
            style={{ transform: `translateY(-${index * 20}px)` }}
          >
            {searchTexts.map((text, i) => (
              <div
                key={i}
                className="text-xs sm:text-sm text-gray-500 h-5 flex items-center whitespace-nowrap"
              >
                Try Searching {text}...
              </div>
            ))}
          </div>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="absolute top-0 left-0 w-full bg-transparent outline-none text-xs sm:text-sm text-gray-700 placeholder-gray-500"
          placeholder={isFocused || inputValue ? "Search products..." : ""}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.trim().length >= 2) setShowResults(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
        />
      </div>
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {searchResults.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-600">₹{parseFloat(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
