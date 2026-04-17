import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

function SizeModal({ isOpen, onClose, product, category, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  
  const categoryName = typeof category === 'string' ? category : category?.name;
  const isSneaker = categoryName?.toLowerCase() === 'sneakers' || 
                    product?.category?.name?.toLowerCase() === 'sneakers';
  
  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
  const sizes = isSneaker ? shoeSizes : clothingSizes;

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSelectedSize('');
  }, [isOpen]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setIsPressed(true);
    onAddToCart(selectedSize);
    setTimeout(() => {
      setIsPressed(false);
      onClose();
      setSelectedSize('');
    }, 800);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <motion.div 
          className="bg-white/95 backdrop-blur-2xl rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100/50" 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-5">
            <h3 className="text-base font-normal text-gray-900 mb-1 tracking-wide">
              Select {isSneaker ? 'Shoe Size' : 'Size'}
            </h3>
            <p className="text-[13px] text-gray-400 line-clamp-1 font-light">{product?.name}</p>
          </div>

          <div className={`grid ${isSneaker ? 'grid-cols-4' : 'grid-cols-5'} gap-2 mb-6`}>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                className={`py-2.5 px-2 border rounded-xl text-[13px] font-light transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  selectedSize === size
                    ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {isSneaker && (
            <p className="text-xs text-gray-400 text-center mb-4">
              Sizes shown in UK standard. Refer to the size guide for conversions.
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-500 rounded-xl font-light hover:bg-gray-50 transition-all duration-300 text-[13px] tracking-wide"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
              disabled={!selectedSize || isPressed}
              className={`flex-1 py-2.5 px-4 rounded-xl text-[13px] font-light tracking-wide transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isPressed
                  ? 'bg-gray-900 text-white scale-[0.97]'
                  : selectedSize
                  ? 'bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.97]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isPressed ? '✓ Added!' : 'Add to Cart'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default SizeModal;