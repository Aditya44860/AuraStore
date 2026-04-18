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
      setProducts([]);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}&limit=100`);
        const data = await response.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extralight text-gray-900 mb-2 sm:mb-3 tracking-tight">Search Results</h1>
            <p className="text-gray-400 text-sm sm:text-[15px] font-light">{query ? `Showing results for "${query}"` : 'Enter a search term'}</p>
          </div>

          {loading ? (
            <ClothingLoader />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-14 h-14 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="text-lg font-light text-gray-400 mb-1 tracking-wide">No products found</h2>
              <p className="text-[13px] text-gray-300 font-light">No products match your search "{query}"</p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-[13px] font-light mb-6">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} id={product.id} name={product.name} price={parseFloat(product.price)} originalPrice={product.originalPrice ? parseFloat(product.originalPrice) : null} image={product.imageUrl} gallery={product.gallery} category={product.category?.name} />
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
