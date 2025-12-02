import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import SizeModal from './SizeModal'

function ProductCard({ id, name, price, originalPrice, image, onAddToCart }) {
  const navigate = useNavigate()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(() => isInWishlist(id))
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const isOnSale = originalPrice && originalPrice > price
  const discount = isOnSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id)
      setIsWishlisted(false)
    } else {
      setIsWishlisted(true)
      addToWishlist({ id, name, price, originalPrice, imageUrl: image }).then(success => {
        if (success === false) {
          setIsWishlisted(false)
        }
      })
    }
  }

  const handleProductClick = () => {
    navigate(`/product/${id}`)
  }

  return (
    <div className="bg-white border border-gray-200 overflow-hidden hover:border-black transition-all relative cursor-pointer" onClick={handleProductClick}>
      {isOnSale && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
          {discount}% OFF
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleWishlist()
        }}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1 bg-white/90 hover:bg-white transition rounded-full"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isWishlisted ? "black" : "none"} stroke={isWishlisted ? "black" : "gray"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <div className="w-full bg-gray-100 flex items-center justify-center aspect-square sm:aspect-[4/5] overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span 
          className="text-gray-400 text-xs sm:text-sm flex items-center justify-center w-full h-full"
          style={{ display: image ? 'none' : 'flex' }}
        >
          Product Image
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-medium text-black mb-2 line-clamp-2">{name}</h3>
        <div className="flex flex-col gap-2">
          {originalPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-black">₹{price}</span>
              <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
            </div>
          ) : (
            <span className="text-base sm:text-lg font-bold text-black">₹{price}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onAddToCart) {
                setIsPressed(true)
                onAddToCart()
                setTimeout(() => setIsPressed(false), 1000)
              } else {
                setShowSizeModal(true)
              }
            }}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 w-full ${
              isPressed 
                ? 'bg-white text-black border border-black scale-95 shadow-inner' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isPressed ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
      
      <SizeModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        product={{ id, name, price, originalPrice, imageUrl: image }}
        onAddToCart={(size) => {
          setIsPressed(true)
          addToCart({ id, name, price, originalPrice, imageUrl: image }, size)
          setTimeout(() => setIsPressed(false), 1000)
          setShowSizeModal(false)
        }}
      />
    </div>
  );
}

export default ProductCard;
