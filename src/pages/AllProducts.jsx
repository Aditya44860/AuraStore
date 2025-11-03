import ProductCard from '../components/ProductCard'

function AllProducts() {
  const products = [
    { id: 1, name: 'Oversized Hoodie', price: 8900, category: 'Upper Wear' },
    { id: 2, name: 'Slim Fit Jeans', price: 12900, category: 'Lower Wear' },
    { id: 3, name: 'Air Max Sneakers', price: 1590, category: 'Sneakers' },
    { id: 4, name: 'Graphic Tee', price: 3900, category: 'Upper Wear' },
    { id: 5, name: 'Cargo Pants', price: 1490, category: 'Lower Wear' },
    { id: 6, name: 'Canvas Shoes', price: 8900, category: 'Sneakers' },
    { id: 7, name: 'Bomber Jacket', price: 1990, category: 'Upper Wear' },
    { id: 8, name: 'Joggers', price: 7900, category: 'Lower Wear' },
    { id: 9, name: 'High-Top Sneakers', price: 1190, category: 'Sneakers' }
  ]

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-gray-600 text-lg">Complete Collection</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All', 'Upper Wear', 'Lower Wear', 'Sneakers'].map(category => (
            <button key={category} className="px-6 py-2 rounded-full border border-gray-300 hover:bg-black hover:text-white transition">
              {category}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard 
              key={product.id}
              name={product.name}
              price={product.price}
              onAddToCart={() => console.log('Added to cart:', product.name)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllProducts