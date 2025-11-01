import ProductCard from '../components/ProductCard'

function UpperWear() {
  const products = [
    { id: 1, name: 'Oversized Hoodie', price: 89, category: 'Hoodies' },
    { id: 2, name: 'Graphic T-Shirt', price: 39, category: 'T-Shirts' },
    { id: 3, name: 'Bomber Jacket', price: 199, category: 'Jackets' },
    { id: 4, name: 'Crew Neck Sweatshirt', price: 69, category: 'Sweatshirts' },
    { id: 5, name: 'Vintage Tee', price: 45, category: 'T-Shirts' },
    { id: 6, name: 'Zip Hoodie', price: 95, category: 'Hoodies' }
  ]

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upper Wear</h1>
          <p className="text-gray-600 text-lg">Hoodies, T-Shirts, Jackets & More</p>
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

export default UpperWear