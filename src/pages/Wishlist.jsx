import ProductCard from '../components/ProductCard'

function Wishlist() {
  const wishlistItems = [
    { id: 1, name: 'Vintage Hoodie', price: 89 },
    { id: 2, name: 'Designer Jeans', price: 149 }
  ]

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map(item => (
              <ProductCard 
                key={item.id}
                name={item.name}
                price={item.price}
                onAddToCart={() => console.log('Added to cart:', item.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist