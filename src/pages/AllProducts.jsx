import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ClothingLoader from "../components/ClothingLoader";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url =
          selectedFilter === "all"
            ? `${import.meta.env.VITE_API_BASE_URL}/api/products`
            : `${
                import.meta.env.VITE_API_BASE_URL
              }/api/products?subcategory=${selectedFilter}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          let sorted = [...data.products];
          if (sortBy === "price-asc") {
            sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          } else if (sortBy === "price-desc") {
            sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          }
          setProducts(sorted);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("Error connecting to server");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedFilter, sortBy]);

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: "url(/website_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* White overlay covers the entire background */}
      <div className="absolute inset-0 bg-white/50 h-full w-full"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              All Products
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6">
              Complete Collection
            </p>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "all"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("hoodies")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "hoodies"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Hoodies
              </button>
              <button
                onClick={() => setSelectedFilter("tshirts")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "tshirts"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                T-Shirts
              </button>
              <button
                onClick={() => setSelectedFilter("jackets")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "jackets"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Jackets
              </button>
              <button
                onClick={() => setSelectedFilter("jeans")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "jeans"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Jeans
              </button>
              <button
                onClick={() => setSelectedFilter("cargos")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "cargos"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Cargos
              </button>
              <button
                onClick={() => setSelectedFilter("shorts")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "shorts"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Shorts
              </button>
              <button
                onClick={() => setSelectedFilter("sneakers")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "sneakers"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sneakers
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <div className="relative" style={{ width: "85px" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full pl-2 pr-6 py-1.5 text-xs font-medium border border-gray-300 bg-white text-transparent rounded-full hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <span className="text-xs font-medium text-gray-700">
                  Sort By
                </span>
                <svg
                  className="w-3 h-3 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={parseFloat(product.price)}
                  originalPrice={
                    product.originalPrice
                      ? parseFloat(product.originalPrice)
                      : null
                  }
                  image={product.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllProducts;
