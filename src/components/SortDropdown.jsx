import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' }
];

const SortDropdown = ({ currentOption, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = SORT_OPTIONS.find(opt => opt.id === currentOption) || SORT_OPTIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md hover:border-gray-400 transition-all duration-300 group"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Sort By:</span>
        <span className="text-[11px] font-medium text-gray-900">{selectedOption.label}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-3 h-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Dropdown Dialogue */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-2 z-[100] origin-top-right"
          >
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => {
                const isActive = option.id === currentOption;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSelect(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gray-900 text-white' 
                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-[11px] font-medium tracking-wide">{option.label}</span>
                    {isActive ? (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-transparent rounded-full group-hover:bg-gray-200 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;
