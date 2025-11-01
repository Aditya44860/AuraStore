import ProductCard from '../components/ProductCard'

function LowerWear() {
  const products = [
    { id: 1, name: 'Slim Fit Jeans', price: 129, category: 'Jeans' },
    { id: 2, name: 'Cargo Pants', price: 149, category: 'Pants' },
    { id: 3, name: 'Joggers', price: 79, category: 'Joggers' },
    { id: 4, name: 'Chino Shorts', price: 59, category: 'Shorts' },
    { id: 5, name: 'Track Pants', price: 69, category: 'Track Pants' },
    { id: 6, name: 'Denim Shorts', price: 65, category: 'Shorts' }
  ]

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bottom Wear</h1>
          <p className="text-gray-600 text-lg">Jeans, Pants, Shorts & More</p>
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

export default LowerWear