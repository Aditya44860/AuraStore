import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import ClothingLoader from '../components/ClothingLoader'

function UpperWear() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products/category/Upper Wear')
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products)
        } else {
          setError('Failed to fetch products')
        }
      } catch (err) {
        setError('Error connecting to server')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: 'url(/website_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* White overlay that fully covers the background */}
      <div className="absolute inset-0 bg-white/50 h-full w-full"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upper Wear</h1>
            <p className="text-gray-600 text-lg">
              Hoodies, T-Shirts, Jackets & More
            </p>
          </div>

          {loading ? (
            <ClothingLoader />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={parseFloat(product.price)}
                  originalPrice={product.originalPrice ? parseFloat(product.originalPrice) : null}
                  image={product.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpperWear
