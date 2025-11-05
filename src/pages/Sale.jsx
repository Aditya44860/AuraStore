import ProductCard from "../components/ProductCard";

function Sale() {
  const products = [
    {
      id: 1,
      name: "Vintage Hoodie",
      price: 59,
      originalPrice: 89,
      discount: "34% OFF",
    },
    {
      id: 2,
      name: "Classic Jeans",
      price: 79,
      originalPrice: 129,
      discount: "39% OFF",
    },
    {
      id: 3,
      name: "Summer Tee",
      price: 25,
      originalPrice: 39,
      discount: "36% OFF",
    },
    {
      id: 4,
      name: "Denim Jacket",
      price: 99,
      originalPrice: 159,
      discount: "38% OFF",
    },
    {
      id: 5,
      name: "Track Pants",
      price: 45,
      originalPrice: 69,
      discount: "35% OFF",
    },
    {
      id: 6,
      name: "Casual Sneakers",
      price: 69,
      originalPrice: 119,
      discount: "42% OFF",
    },
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
              <span className="text-red-500">Sale</span> Market
            </h1>
            <p className="text-gray-600 text-lg">
              Up to 50% Off on Selected Items
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                  {product.discount}
                </div>
                <ProductCard
                  name={product.name}
                  price={product.price}
                  onAddToCart={() =>
                    console.log("Added to cart:", product.name)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sale;
