import ProductCard from "../components/ProductCard";

function LowerWear() {
  const products = [
    { id: 1, name: "Slim Fit Jeans", price: 2199, category: "Jeans" },
    { id: 2, name: "Cargo Pants", price: 1799, category: "Pants" },
    { id: 3, name: "Joggers", price: 1299, category: "Joggers" },
    { id: 4, name: "Chino Shorts", price: 999, category: "Shorts" },
    { id: 5, name: "Track Pants", price: 1199, category: "Track Pants" },
    { id: 6, name: "Denim Shorts", price: 1099, category: "Shorts" },
  ];

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
              Bottom Wear
            </h1>
            <p className="text-gray-600 text-lg">Jeans, Pants, Shorts & More</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
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

export default LowerWear;
