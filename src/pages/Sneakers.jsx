import ProductCard from '../components/ProductCard'

function Sneakers() {
  const products = [
    { id: 1, name: 'Air Max Classic', price: 159, category: 'Running' },
    { id: 2, name: 'Canvas High-Tops', price: 89, category: 'Casual' },
    { id: 3, name: 'Basketball Shoes', price: 179, category: 'Sports' },
    { id: 4, name: 'Slip-On Sneakers', price: 69, category: 'Casual' },
    { id: 5, name: 'Running Shoes', price: 139, category: 'Running' },
    { id: 6, name: 'Retro Sneakers', price: 119, category: 'Lifestyle' }
  ]

  return (
  <div
    style={{
      backgroundImage: 'url(/website_background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      position: 'relative'
    }}
  >
    <div className="absolute inset-0 bg-white/50 h-full"></div> 
    <div className="relative z-10 min-h-screen"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sneakers</h1>
          <p className="text-gray-600 text-lg">Step Up Your Game</p>
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
  </div>
)
}

export default Sneakers