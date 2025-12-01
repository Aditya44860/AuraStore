import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ClothingLoader from "../components/ClothingLoader";

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = selectedFilter === 'all'
          ? `${import.meta.env.VITE_API_BASE_URL}/api/products/sale`
          : `${import.meta.env.VITE_API_BASE_URL}/api/products/sale?subcategory=${selectedFilter}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          let sorted = [...data.products];
          if (sortBy === 'price-asc') {
            sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          } else if (sortBy === 'price-desc') {
            sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          }
          setProducts(sorted);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedFilter, sortBy]);

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice) return null;
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    return `${discount}% OFF`;
  };

  return (
    <div
      style={{
        backgroundImage: "url(/website_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div className="absolute inset-0 bg-white/50 h-full"></div>
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="text-red-500">Sale</span> Market
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Up to 50% Off on Selected Items
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setSelectedFilter('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>All</button>
              <button onClick={() => setSelectedFilter('hoodies')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'hoodies' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>Hoodies</button>
              <button onClick={() => setSelectedFilter('tshirts')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'tshirts' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>T-Shirts</button>
              <button onClick={() => setSelectedFilter('jackets')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'jackets' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>Jackets</button>
              <button onClick={() => setSelectedFilter('jeans')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'jeans' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>Jeans</button>
              <button onClick={() => setSelectedFilter('cargos')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'cargos' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>Cargos</button>
              <button onClick={() => setSelectedFilter('shorts')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'shorts' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>Shorts</button>
              <button onClick={() => setSelectedFilter('sneakers')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedFilter === 'sneakers' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}>Sneakers</button>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <div className="relative" style={{width: '85px'}}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none w-full pl-2 pr-6 py-1.5 text-xs font-medium border border-gray-300 bg-white text-transparent rounded-full hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black">
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <span className="text-xs font-medium text-gray-700">Sort By</span>
                <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <ClothingLoader />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const discount = calculateDiscount(parseFloat(product.price), parseFloat(product.originalPrice));
                return (
                  <div key={product.id} className="relative">
                    {discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                        {discount}
                      </div>
                    )}
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={parseFloat(product.price)}
                      originalPrice={parseFloat(product.originalPrice)}
                      image={product.imageUrl}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sale;
