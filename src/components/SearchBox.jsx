import { useState, useEffect, useRef } from "react";

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
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset without animation when reaching halfway
    if (index === baseTexts.length) {
      setTimeout(() => {
        setTransition(false);
        setIndex(0);
      }, 500); // wait till slide finishes
      setTimeout(() => {
        setTransition(true);
      }, 600);
    }
  }, [index, baseTexts.length]);

  return (
    <div className="relative flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 shadow-sm">
      <svg
        className="w-4 h-4 text-gray-500 mr-2"
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
                className="text-sm text-gray-500 h-5 flex items-center whitespace-nowrap"
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
          className="absolute top-0 left-0 w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
          placeholder={isFocused || inputValue ? "Search products..." : ""}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
}

export default SearchBox;
