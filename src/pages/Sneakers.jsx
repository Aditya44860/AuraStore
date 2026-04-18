import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import ClothingLoader from '../components/ClothingLoader'
import SortDropdown from '../components/SortDropdown'

function Sneakers() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/category/Sneakers?page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}`)
        const data = await response.json()

        if (data.success) {
          setProducts(data.products)
          setTotalPages(data.pagination?.totalPages || 1)
        } else {
          setError('Failed to fetch products')
        }
      } catch (err) {
        setError('Error connecting to server')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [sortBy, currentPage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  useEffect(() => {
    const params = new URLSearchParams()
    if (sortBy !== 'latest') params.set('sort', sortBy)
    if (currentPage !== 1) params.set('page', currentPage.toString())
    setSearchParams(params, { replace: true })
  }, [sortBy, currentPage, setSearchParams])

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extralight text-gray-900 mb-2 sm:mb-3 tracking-tight">Sneakers</h1>
            <p className="text-gray-500 text-sm sm:text-[15px] font-medium">Step Up Your Game</p>
          </div>

          <div className="flex justify-end mb-6">
            <SortDropdown 
              currentOption={sortBy} 
              onSelect={(value) => setSortBy(value)} 
            />
          </div>

          {loading && products.length === 0 ? (
            <ClothingLoader />
          ) : error ? (
            <div className="text-center py-12"><p className="text-red-500 font-light">{error}</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} id={product.id} name={product.name} price={parseFloat(product.price)} originalPrice={product.originalPrice ? parseFloat(product.originalPrice) : null} image={product.imageUrl} gallery={product.gallery} category={product.category?.name || 'Sneakers'} />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-[12px] font-light tracking-wide hover:border-gray-400 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-gray-500">Previous</button>
              <span className="px-4 py-2 text-[12px] font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-[12px] font-light tracking-wide hover:border-gray-400 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-gray-500">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sneakers