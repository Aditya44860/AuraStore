import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ClothingLoader from '../components/ClothingLoader';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products?limit=1000`);
        const data = await response.json();
        
        if (data.success) {
          const filtered = data.products.filter(product => {
            const searchTerm = query.toLowerCase();
            return (
              product.name.toLowerCase().includes(searchTerm) ||
              product.category?.name.toLowerCase().includes(searchTerm) ||
              product.subcategory?.toLowerCase().includes(searchTerm)
            );
          });
          setProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [query]);

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: 'url(/website_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-white/50 h-full w-full"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Search Results
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              {query ? `Showing results for "${query}"` : 'Enter a search term'}
            </p>
          </div>

          {loading ? (
            <ClothingLoader />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-600">No products match your search "{query}"</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
