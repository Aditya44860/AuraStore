import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ClothingLoader from "../components/ClothingLoader";

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(1);
  const [slidePhase, setSlidePhase] = useState("idle");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  const filterOrder = [
    "all",
    "hoodies",
    "tshirts",
    "jackets",
    "jeans",
    "cargos",
    "shorts",
    "sneakers",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isInitialLoad) {
        setSlidePhase("out");
        setIsTransitioning(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      try {
        const url =
          selectedFilter === "all"
            ? `${
                import.meta.env.VITE_API_BASE_URL
              }/api/products/sale?page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}`
            : `${
                import.meta.env.VITE_API_BASE_URL
              }/api/products/sale?subcategory=${selectedFilter}&page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("Error connecting to server");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        } else {
          setSlidePhase("in");
          setTimeout(() => {
            setIsTransitioning(false);
            setIsSorting(false);
            setSlidePhase("idle");
          }, 100);
        }
      }
    };

    fetchProducts();
  }, [selectedFilter, sortBy, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice) return null;
    const discount = Math.round(
      ((originalPrice - price) / originalPrice) * 100
    );
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
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("all") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("all");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "all"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("hoodies") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("hoodies");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "hoodies"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Hoodies
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("tshirts") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("tshirts");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "tshirts"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                T-Shirts
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("jackets") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("jackets");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "jackets"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Jackets
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("jeans") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("jeans");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "jeans"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Jeans
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("cargos") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("cargos");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "cargos"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Cargos
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("shorts") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("shorts");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedFilter === "shorts"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Shorts
              </button>
              <button
                onClick={() => {
                  setSwipeDirection(
                    filterOrder.indexOf("sneakers") >
                      filterOrder.indexOf(selectedFilter)
                      ? 1
                      : -1
                  );
                  setLoading(true);
                  setCurrentPage(1);
                  setSelectedFilter("sneakers");
                }}
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
                onChange={(e) => {
                  setLoading(true);
                  setIsSorting(true);
                  setSortBy(e.target.value);
                }}
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

          {loading && products.length === 0 ? (
            <ClothingLoader />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No current sale on{" "}
                {selectedFilter === "all" ? "any items" : selectedFilter}
              </h2>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-100"
                style={{
                  transform: isSorting
                    ? slidePhase === "out"
                      ? "translateY(-20px)"
                      : slidePhase === "in"
                      ? "translateY(20px)"
                      : "translateY(0)"
                    : slidePhase === "out"
                    ? `translateX(${swipeDirection * -100}%)`
                    : slidePhase === "in"
                    ? `translateX(${swipeDirection * 100}%)`
                    : "translateX(0)",
                  opacity: isTransitioning ? 0 : 1,
                }}
              >
                {products.map((product) => {
                  const discount = calculateDiscount(
                    parseFloat(product.price),
                    parseFloat(product.originalPrice)
                  );
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
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sale;
