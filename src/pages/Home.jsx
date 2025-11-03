import { useEffect } from "react";
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const underline = entry.target.querySelector(".underline-bar");
          if (underline) {
            if (entry.isIntersecting) {
              underline.classList.add("expand");
              underline.classList.remove("retract");
            } else {
              underline.classList.add("retract");
              underline.classList.remove("expand");
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    const headings = document.querySelectorAll(".animated-heading");
    headings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Carousel */}
      <HeroCarousel />

      <ScrollingText />

      {/* Featured Collections */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2
            className="text-4xl font-bold text-gray-900 mb-3 relative inline-block animated-heading"
            id="welcome-heading"
          >
            Welcome to AuraStore
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 opacity-60 underline-bar"></div>
          </h2>

          <style>{`
            @keyframes expand {
              0% { transform: scaleX(0); transform-origin: center; }
              100% { transform: scaleX(1); transform-origin: center; }
            }
            
            @keyframes retract {
              0% { transform: scaleX(1); transform-origin: center; }
              100% { transform: scaleX(0); transform-origin: center; }
            }
            
            .underline-bar {
              transform: scaleX(0);
              transition: transform 0.3s ease;
            }
            
            .underline-bar.expand {
              animation: expand 0.8s ease-out forwards;
            }
            
            .underline-bar.retract {
              animation: retract 0.5s ease-in forwards;
            }
          `}</style>
          <p className="text-gray-600 text-lg max-w-2xl mt-8 mx-auto mb-8">
            At AuraStore, we redefine modern fashion for the new generation. Our
            collections blend trendsetting streetwear with timeless comfort,
            crafted to inspire self-expression, confidence, and individuality.
            We believe style should be bold, affordable, and effortlessly you.
            Every piece is created with intention, reflecting the rhythm of Gen
            Z culture and the spirit of everyday authenticity. From laid-back
            essentials to standout statement wear, AuraStore invites you to own
            your vibe and express who you are with confidence.
          </p>

          <button className="bg-black text-white px-8 py-2 rounded-full font-semibold hover:bg-gray-800 transition">
            Explore Now
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 relative inline-block animated-heading">
            Best Sellers
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 opacity-60 underline-bar"></div>
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
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 relative inline-block animated-heading">
            New Arrivals
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 opacity-60 underline-bar"></div>
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
          <h2 className="text-3xl font-bold mb-4 relative inline-block animated-heading">
            About AuraStore
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
          </h2>
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
      <section className="py-20 bg-gradient-to-t from-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce"></div>

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 relative inline-block animated-heading">
              Stay Connected
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-6 relative inline-block">
                Contact Us
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="text-2xl">📧</div>
                  <span className="text-gray-300 hover:text-white transition-colors">
                    hello@aurastore.com
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="text-2xl">📞</div>
                  <span className="text-gray-300 hover:text-white transition-colors">
                    +1 (555) 123-4567
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="text-2xl">📍</div>
                  <span className="text-gray-300 hover:text-white transition-colors">
                    123 Fashion Street, NY 10001
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-6 relative inline-block">
                Join Our Community
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Get early access to drops, exclusive offers, and trend updates.
                Be part of the AuraStore family.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                />
                <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 hover:scale-105 transition-all duration-200 relative overflow-hidden group">
                  <span className="relative z-10">Subscribe</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
