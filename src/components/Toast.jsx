import { useEffect, useState } from "react";

function Toast({ message, isVisible, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(onClose, 500); // Wait for fade animation
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    if (!isVisible) {
      setIsClosing(false);
    }
  }, [isVisible]);

  // Temporarily disabled
  return null;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1.5 rounded-md shadow-lg z-50 transition-opacity duration-300 ${
        isClosing
          ? "opacity-0 animate-slide-up"
          : "opacity-100 animate-slide-up"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        {message}
      </div>
    </div>
  );
}

export default Toast;
