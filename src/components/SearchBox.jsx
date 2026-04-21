import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SearchBox({ onSearchSubmit, autoFocus = false, isTransparent = false }) {
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

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
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
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);



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

    const searchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/search?q=${encodeURIComponent(inputValue)}&limit=5`);
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.products);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    const debounce = setTimeout(() => {
      searchProducts();
    }, 150);

    return () => clearTimeout(debounce);
  }, [inputValue]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setInputValue("");
    setShowResults(false);
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      setShowResults(false);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <div className="relative w-full sm:w-64 lg:w-72" ref={dropdownRef}>
      <div className={`relative flex items-center rounded-full px-3 sm:px-4 py-2 transition-all duration-300 ${
        isTransparent 
          ? "bg-white/10 border border-white/20 backdrop-blur-sm" 
          : "bg-gray-100/50 border border-transparent"
      }`}>
        <svg
          className={`w-4 h-4 mr-2 flex-shrink-0 transition-colors duration-300 ${isTransparent ? "text-white/60" : "text-gray-400"}`}
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
                className="text-[12px] sm:text-[13px] text-gray-400 h-5 flex items-center whitespace-nowrap font-light"
              >
                Try Searching {text}...
              </div>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`absolute top-0 left-0 w-full bg-transparent outline-none text-[12px] sm:text-[13px] font-normal transition-colors duration-300 ${
            isTransparent ? "text-white placeholder-white/70" : "text-gray-900 placeholder-gray-500"
          }`}
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
        <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-100/50 z-50 max-h-80 overflow-y-auto">
          {searchResults.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50/80 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-colors duration-200"
            >
              <div className="w-11 h-11 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-light text-gray-900 truncate">{product.name}</p>
                <p className="text-[12px] text-gray-400 font-light">₹{parseFloat(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
