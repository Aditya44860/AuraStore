import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function SizeModal({ isOpen, onClose, product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

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

  const handleAddToCart = () => {
    if (!selectedSize) {
      return;
    }
    setIsPressed(true);
    onAddToCart(selectedSize);
    setTimeout(() => {
      setIsPressed(false);
      onClose();
      setSelectedSize('');
    }, 1000);
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center p-4" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-sm w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Size
          </h3>
          <p className="text-sm text-gray-600">{product?.name}</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSize(size);
              }}
              className={`py-2 px-3 border rounded-md text-sm font-medium transition-all transform ${
                selectedSize === size
                  ? 'border-black bg-black text-white shadow-lg scale-95'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
              style={{
                boxShadow:
                  selectedSize === size
                    ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                    : '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
              }}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!selectedSize || isPressed}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
              isPressed
                ? 'bg-white text-black border border-black scale-95 shadow-inner'
                : selectedSize
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPressed ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SizeModal;