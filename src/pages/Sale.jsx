import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ClothingLoader from "../components/ClothingLoader";

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/sale`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
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
  }, []);

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
            <p className="text-gray-600 text-lg">
              Up to 50% Off on Selected Items
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
