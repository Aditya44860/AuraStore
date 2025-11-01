import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import ScrollingBrands from "../components/ScrollingBrands";
import ScrollingText from "../components/ScrollingText";

function Home() {
  const bestSellers = [
    { id: 1, name: "Bestseller Hoodie", price: 89 },
    { id: 2, name: "Popular Jeans", price: 129 },
    { id: 3, name: "Top T-Shirt", price: 39 },
    { id: 4, name: "Trending Jacket", price: 199 },
  ];

  const newArrivals = [
    { id: 5, name: "New Hoodie", price: 95 },
    { id: 6, name: "Fresh Jeans", price: 135 },
    { id: 7, name: "Latest Tee", price: 45 },
    { id: 8, name: "Modern Jacket", price: 210 },
  ];

  return (
    <div className="bg-white">
      {/* Hero Carousel */}
      <HeroCarousel />

      <ScrollingText />

      {/* Featured Collections */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to AuraStore
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            At AuraStore, we redefine modern fashion for the new generation. Our
            collections fuse trendsetting streetwear with timeless comfort —
            crafted to empower self-expression, confidence, and individuality.
            We believe style should be bold, affordable, and effortlessly you.
          </p>

          <button className="bg-black text-white px-8 py-2 rounded-full font-semibold hover:bg-gray-800 transition">
            Explore Now
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Best Sellers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                onAddToCart={() => console.log("Added to cart:", product.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                onAddToCart={() => console.log("Added to cart:", product.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured On */}
      <section className="py-10 bg-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            Featured On
          </h2>
        </div>
        <ScrollingBrands />
      </section>

      <section className="relative overflow-hidden">
        <img
          src="home_page_traits.png"
          alt="AuraStore Traits"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Lifestyle Image Section */}
      <section className="relative aspect-[16/8] overflow-hidden">
        <img
          src="/t1.webp"
          alt="AuraStore Traits"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay (20% black) */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Gradient and text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center text-center">
          <div className="text-white">
            <h3 className="text-4xl font-bold mb-3">
              Premium Quality Guaranteed
            </h3>
            <p className="text-lg text-gray-200">
              Crafted with the finest materials for lasting comfort and
              confidence
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story / About */}
      <section className="py-16 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">About AuraStore</h2>
          <p className="text-lg leading-relaxed mb-6 text-gray-300">
            Redefining fashion for the modern generation — AuraStore blends
            minimalist design, premium fabrics, and street-inspired aesthetics.
            Every piece tells a story of individuality and authenticity.
          </p>
          <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Contact & Subscribe */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li>📧 hello@aurastore.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>📍 123 Fashion Street, NY 10001</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Join Our Community</h3>
            <p className="text-gray-400 mb-4">
              Get early access to drops, exclusive offers, and trend updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-md text-black focus:outline-none"
              />
              <button className="bg-white text-black px-6 py-3 rounded-r-md font-semibold hover:bg-gray-200 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
