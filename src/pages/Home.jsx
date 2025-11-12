import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import ScrollingBrands from "../components/ScrollingBrands";
import ScrollingText from "../components/ScrollingText";

function Home() {
  const [email, setEmail] = useState("");
  const [showTick, setShowTick] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    // Show tick and clear input immediately
    setShowTick(true);
    const emailToSend = email;
    setEmail("");
    setTimeout(() => setShowTick(false), 2000);

    // Send email in background
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToSend }),
      });
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  };

  const bestSellers = [
    { id: 1, name: "Bestseller Hoodie", price: 2499 },
    { id: 2, name: "Popular Jeans", price: 1899 },
    { id: 3, name: "Top T-Shirt", price: 799 },
    { id: 4, name: "Trending Jacket", price: 3499 },
  ];

  const newArrivals = [
    { id: 5, name: "New Hoodie", price: 2699 },
    { id: 6, name: "Fresh Jeans", price: 1999 },
    { id: 7, name: "Latest Tee", price: 899 },
    { id: 8, name: "Modern Jacket", price: 3799 },
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
    <div
      style={{
        backgroundImage: "url(/website_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-white/50"></div>
      <div className="relative z-10">
        {/* Hero Carousel */}
        <HeroCarousel />

        <ScrollingText />

        {/* Featured Collections */}
        <motion.section
          className="py-12 bg-gray-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4 text-center">
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 relative inline-block animated-heading"
              id="welcome-heading"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Welcome to AuraStore
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-600 via-purple-600 to-red-600 underline-bar"></div>
            </motion.h2>

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

            <motion.p
              className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mt-6 sm:mt-8 mx-auto mb-6 sm:mb-8 px-4 sm:px-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              At AuraStore, we redefine modern fashion for the new generation.
              Our collections blend trendsetting streetwear with timeless
              comfort, crafted to inspire self-expression, confidence, and
              individuality. We believe style should be bold, affordable, and
              effortlessly you. Every piece is created with intention,
              reflecting the rhythm of Gen Z culture and the spirit of everyday
              authenticity. From laid-back essentials to standout statement
              wear, AuraStore invites you to own your vibe and express who you
              are with confidence.
            </motion.p>

            <motion.button
              className="bg-black text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold hover:bg-gray-800 transition"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Explore Now
            </motion.button>
          </div>
        </motion.section>

        {/* Best Sellers */}
        <motion.section
          className="py-12 bg-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900 relative inline-block animated-heading"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Best Sellers
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 opacity-60 underline-bar"></div>
            </motion.h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 w-max lg:grid lg:grid-cols-3 lg:grid-flow-col lg:auto-cols-max ">
                {bestSellers.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="w-48 sm:w-56 lg:w-80 flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      onAddToCart={() =>
                        console.log("Added to cart:", product.name)
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* New Arrivals */}
        <motion.section
          className="py-12 bg-gray-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900 relative inline-block animated-heading"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              New Arrivals
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 opacity-60 underline-bar"></div>
            </motion.h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 w-max lg:grid lg:grid-cols-3 lg:grid-flow-col lg:auto-cols-max ">
                {newArrivals.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="w-48 sm:w-56 lg:w-80 flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      onAddToCart={() =>
                        console.log("Added to cart:", product.name)
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured On */}
        <section className="py-10 bg-white">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide">
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
        <section className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/8] overflow-hidden">
          <img
            src="/t1.webp"
            alt="AuraStore Traits"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay (20% black) */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Gradient and text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center text-center">
            <div className="text-white px-4 sm:px-6">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                Premium Quality Guaranteed
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200">
                Crafted with the finest materials for lasting comfort and
                confidence
              </p>
            </div>
          </div>
        </section>

        {/* Brand Story / About */}
        <section className="py-12 sm:py-16 bg-black text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative inline-block animated-heading">
              About AuraStore
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-6 text-gray-300">
              Redefining fashion for the modern generation — AuraStore blends
              minimalist design, premium fabrics, and street-inspired
              aesthetics. Every piece tells a story of individuality and
              authenticity.
            </p>
            <button className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold hover:bg-gray-200 transition">
              Learn More
            </button>
          </div>
        </section>

        {/* Contact & Subscribe */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-t from-gray-900 to-black text-white relative overflow-hidden">
          <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative inline-block animated-heading">
                Stay Connected
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <motion.div
                className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 relative inline-block">
                  Contact Us
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="text-white flex-shrink-0">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <span className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base break-all">
                      aurastore.app@gmail.com
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="text-white flex-shrink-0">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </div>
                    <span className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                      +91-1234567890
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="text-white flex-shrink-0">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </div>
                    <span className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                      Sonipat
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 relative inline-block">
                  Join Our Community
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 via-white/60 to-white/40 opacity-60 underline-bar"></div>
                </h3>
                <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Get early access to drops, exclusive offers, and trend
                  updates. Be part of the AuraStore family.
                </p>
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col gap-3"
                >
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                    {showTick && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-2000 opacity-100 animate-tick-glow">
                        <div className="relative">
                          <svg
                            className="w-6 h-6 text-white drop-shadow-xl animate-scale-in"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="#000"
                              className="animate-pulse"
                            />
                            <path
                              d="M9 12l2 2 4-4"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                          <div className="absolute inset-0 rounded-full bg-black opacity-20 blur-md animate-ping"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-200 hover:scale-105 transition-all duration-200 relative overflow-hidden group text-sm sm:text-base"
                  >
                    <span className="relative z-10">Subscribe</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes tick-glow {
          0% {
            opacity: 0;
            transform: translateY(-50%) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateY(-50%) scale(1.1);
          }
          80% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) scale(0.9);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-tick-glow {
          animation: tick-glow 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Home;
