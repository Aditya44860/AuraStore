import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import SizeModal from './SizeModal'

function ProductCard({ id, name, price, originalPrice, image, gallery = [], category, onAddToCart }) {
  const navigate = useNavigate()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(() => isInWishlist(id))
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isBursting, setIsBursting] = useState(false)

  const isOnSale = originalPrice && originalPrice > price
  const discount = isOnSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  const images = gallery.length > 0 ? [image, ...gallery] : [image];

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id)
      setIsWishlisted(false)
    } else {
      setIsWishlisted(true)
      setIsBursting(true)
      setTimeout(() => setIsBursting(false), 800)
      
      addToWishlist({ id, name, price, originalPrice, imageUrl: image, category }).then(success => {
        if (success === false) {
          setIsWishlisted(false)
          setIsBursting(false)
        }
      })
    }
  }

  const handleProductClick = () => {
    navigate(`/product/${id}`)
  }

  return (
    <div
      className="product-card relative bg-white rounded-xl border border-gray-100/80 overflow-hidden cursor-pointer group"
      onClick={handleProductClick}
    >
      {isOnSale && (
        <div className="absolute top-3 left-3 bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-light z-10 tracking-[0.1em] uppercase">
          {discount}% Off
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleWishlist()
        }}
        className="absolute top-2 right-2 z-10 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm transition-all duration-300 overflow-visible"
      >
        <AnimatePresence>
          {isBursting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-white rounded-full shadow-[0_0_30px_white]"
              />
            </div>
          )}
        </AnimatePresence>

        <motion.div
          animate={isWishlisted ? {
            filter: [
              "drop-shadow(0 0 2px white)",
              "drop-shadow(0 0 8px white)",
              "drop-shadow(0 0 2px white)"
            ]
          } : { filter: "none" }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg
            className={`w-4 h-4 transition-all duration-400 ${isWishlisted ? 'scale-110' : 'scale-100'}`}
            fill={isWishlisted ? "#1a1a1a" : "none"}
            stroke={isWishlisted ? "#1a1a1a" : "#9ca3af"}
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.div>
      </button>
      <div
        className="relative w-full bg-gray-50 flex flex-nowrap gap-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar aspect-[3/4]"
        style={{ overscrollBehaviorX: "contain" }}
      >
        {images.length > 0 && images[0] ? (
          images.map((img, idx) => (
            <div key={idx} className="w-full flex-shrink-0 snap-start relative h-full overflow-hidden">
              <img
                src={img}
                alt={`${name} angle ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))
        ) : (
          <span className="text-gray-300 text-xs flex items-center justify-center w-full h-full absolute inset-0 font-light">
            Product Image
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-[13px] font-light text-gray-900 mb-2.5 line-clamp-2 leading-snug tracking-wide">{name}</h3>
        <div className="flex flex-col gap-3">
          {originalPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-normal text-gray-900">₹{price}</span>
              <span className="text-[13px] text-gray-300 line-through font-light">₹{originalPrice}</span>
            </div>
          ) : (
            <span className="text-[15px] font-normal text-gray-900">₹{price}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onAddToCart) {
                setIsPressed(true)
                onAddToCart()
                removeFromWishlist(id)
                setTimeout(() => setIsPressed(false), 1000)
              } else {
                setShowSizeModal(true)
              }
            }}
            className={`px-4 py-2.5 text-[11px] font-light tracking-[0.12em] uppercase rounded-lg transition-all duration-500 w-full ${isPressed
              ? 'bg-gray-900 text-white scale-[0.97]'
              : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.97]'
              }`}
          >
            {isPressed ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <SizeModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        product={{ id, name, price, originalPrice, imageUrl: image }}
        category={category}
        onAddToCart={(size) => {
          setIsPressed(true)
          addToCart({ id, name, price, originalPrice, imageUrl: image }, size)
          removeFromWishlist(id)
          setTimeout(() => setIsPressed(false), 1000)
          setShowSizeModal(false)
        }}
      />
    </div>
  );
}

export default ProductCard;
