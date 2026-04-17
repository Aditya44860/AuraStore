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
  const [availableFilters, setAvailableFilters] = useState(["all"]);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/sale/subcategories`);
        const data = await response.json();
        if (data.success) {
          setAvailableFilters(["all", ...data.subcategories]);
        }
      } catch (err) {
        console.error("Error fetching available filters:", err);
      }
    };
    fetchFilters();
  }, []);

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
            ? `${import.meta.env.VITE_API_BASE_URL}/api/products/sale?page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}`
            : `${import.meta.env.VITE_API_BASE_URL}/api/products/sale?subcategory=${selectedFilter}&page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}`;
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

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extralight text-gray-900 mb-2 sm:mb-3 tracking-tight">
              <span className="text-red-500">Sale</span> Market
            </h1>
            <p className="text-gray-400 text-sm sm:text-[15px] font-light mb-8">Up to 50% Off on Selected Items</p>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    if (selectedFilter !== filter) {
                      setSwipeDirection(availableFilters.indexOf(filter) > availableFilters.indexOf(selectedFilter) ? 1 : -1);
                      setLoading(true); setCurrentPage(1); setSelectedFilter(filter);
                    }
                  }}
                  className={`px-5 py-2 rounded-full text-[12px] font-light tracking-wide transition-all duration-300 capitalize ${
                    selectedFilter === filter ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <div className="relative" style={{ width: "85px" }}>
              <select value={sortBy} onChange={(e) => { setLoading(true); setIsSorting(true); setSortBy(e.target.value); }} className="appearance-none w-full pl-2 pr-6 py-1.5 text-[11px] font-light border border-gray-200 bg-white text-transparent rounded-full hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300">
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <span className="text-[11px] font-light text-gray-500">Sort By</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <ClothingLoader />
          ) : error ? (
            <div className="text-center py-12"><p className="text-red-500 font-light">{error}</p></div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-14 h-14 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="text-lg font-light text-gray-400 mb-1 tracking-wide">No current sale on {selectedFilter === "all" ? "any items" : selectedFilter}</h2>
              <p className="text-[13px] text-gray-300 font-light">Check back soon for new deals</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                style={{
                  transform: isSorting
                    ? (slidePhase === 'out' ? 'translateY(-20px)' : slidePhase === 'in' ? 'translateY(20px)' : 'translateY(0)')
                    : (slidePhase === 'out' ? `translateX(${swipeDirection * -100}%)` : slidePhase === 'in' ? `translateX(${swipeDirection * 100}%)` : 'translateX(0)'),
                  opacity: isTransitioning ? 0 : 1
                }}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} id={product.id} name={product.name} price={parseFloat(product.price)} originalPrice={parseFloat(product.originalPrice)} image={product.imageUrl} gallery={product.gallery} category={product.category?.name} />
                ))}
              </div>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-[12px] font-light tracking-wide hover:border-gray-400 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-gray-500">Previous</button>
              <span className="px-4 py-2 text-[12px] font-light text-gray-400">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-[12px] font-light tracking-wide hover:border-gray-400 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-gray-500">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sale;
