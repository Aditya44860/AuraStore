import ProductCard from "../components/ProductCard";

function AllProducts() {
  const products = [
    { id: 1, name: "Oversized Hoodie", price: 8900, category: "Upper Wear" },
    { id: 2, name: "Slim Fit Jeans", price: 12900, category: "Bottom Wear" },
    { id: 3, name: "Air Max Sneakers", price: 1590, category: "Sneakers" },
    { id: 4, name: "Graphic Tee", price: 3900, category: "Upper Wear" },
    { id: 5, name: "Cargo Pants", price: 1490, category: "Bottom Wear" },
    { id: 6, name: "Canvas Shoes", price: 8900, category: "Sneakers" },
    { id: 7, name: "Bomber Jacket", price: 1990, category: "Upper Wear" },
    { id: 8, name: "Joggers", price: 7900, category: "Bottom Wear" },
    { id: 9, name: "High-Top Sneakers", price: 1190, category: "Sneakers" },
  ];

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
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Complete Collection</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                onAddToCart={() => console.log("Added to cart:", product.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllProducts;
