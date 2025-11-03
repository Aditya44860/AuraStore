import { useState } from 'react'

function ProductCard({ name, price, image, onAddToCart }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    console.log(isWishlisted ? 'Removed from wishlist:' : 'Added to wishlist:', name)
  }

  return (
    <div className="bg-white border border-gray-200 overflow-hidden hover:border-black transition-all relative">
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-1 bg-white/90 hover:bg-white transition"
      >
        <svg className="w-5 h-5" fill={isWishlisted ? "black" : "none"} stroke={isWishlisted ? "black" : "gray"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <div className="w-full bg-gray-100 flex items-center justify-center" style={{height: '360px'}}>
        <span className="text-gray-400 text-sm">
          {image || "Product Image"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-black mb-2">{name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-black">₹{price}</span>
          <button
            onClick={onAddToCart}
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
