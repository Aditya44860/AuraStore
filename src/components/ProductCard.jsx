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
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1 bg-white/90 hover:bg-white transition rounded-full"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isWishlisted ? "black" : "none"} stroke={isWishlisted ? "black" : "gray"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <div className="w-full bg-gray-100 flex items-center justify-center aspect-square sm:aspect-[4/5]">
        <span className="text-gray-400 text-xs sm:text-sm">
          {image || "Product Image"}
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-medium text-black mb-2 line-clamp-2">{name}</h3>
        <div className="flex flex-col gap-2">
          <span className="text-base sm:text-lg font-bold text-black">₹{price}</span>
          <button
            onClick={onAddToCart}
            className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors duration-200 w-full"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
