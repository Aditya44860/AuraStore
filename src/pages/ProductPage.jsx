import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showFlicker, setShowFlicker] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showTransitionGlow, setShowTransitionGlow] = useState(false);

  // Mock product data - in real app this would come from API/context
  const product = {
    id: id,
    name: "Oversized T-Shirt",
    price: 2499,
    originalPrice: null,
    description:
      "Premium oversized t-shirt crafted with high-quality materials for ultimate comfort and style.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/product-placeholder.jpg"],
    keyHighlights: {
      gender: "Men",
      category: "Topwear",
      type: "Oversized Tshirt",
      fit: "Oversized Fit",
      closure: "No Closure",
      length: "Regular",
    },
  };

  const toggleWishlist = () => {
    const newWishlistState = !isWishlisted;
    setIsWishlisted(newWishlistState);

    if (newWishlistState) {
      setShowReflection(true);
      setTimeout(() => {
        setShowReflection(false);
        setShowFlicker(true);

        // After flicker ends, fade smoothly into static glow
        setTimeout(() => {
          setShowFlicker(false);
          setTimeout(() => setShowTransitionGlow(true), 10); // start fade bridge
          setTimeout(() => setShowTransitionGlow(false), 400); // end fade bridge
        }, 1500);
      }, 600);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: "url(/website_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/50 h-full w-full"></div>
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 hover:text-black transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-lg">Product Image</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-black">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-all transform ${
                        selectedSize === size
                          ? "border-black bg-black text-white shadow-lg scale-95"
                          : "border-gray-300 text-gray-700 hover:border-gray-400 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                      }`}
                      style={{
                        boxShadow:
                          selectedSize === size
                            ? "inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)"
                            : "0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wishlist and Add to Cart */}
              <div className="flex gap-3">
                <button
                  onClick={toggleWishlist}
                  className={`flex-1 border py-3 px-6 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 transform relative overflow-hidden ${
                    isWishlisted
                      ? "border-black bg-black text-white scale-95"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 hover:scale-105 active:scale-95"
                  }`}
                  style={{
                    boxShadow: isWishlisted
                      ? "inset 0 2px 4px rgba(0,0,0,0.3), -4px 4px 8px rgba(0,0,0,0.8)"
                      : "0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {showReflection && (
                    <div className="absolute inset-0 animate-reflection bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"></div>
                  )}
                  <svg
                    className={`w-5 h-5 transition-all duration-500 ${
                      showFlicker ? "animate-flicker" : ""
                    }`}
                    fill={isWishlisted ? "white" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      transition: "filter 0.5s ease, opacity 0.5s ease, transform 0.5s ease",
                      opacity: isWishlisted ? 1 : 1,
                      filter:
                        showFlicker || showTransitionGlow
                          ? // glowing flicker or bridge phase
                            "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 15px rgba(255,255,255,0.7)) drop-shadow(0 0 25px rgba(255,255,255,0.5))"
                          : isWishlisted
                          ? // steady state glow (identical perceived brightness)
                            "drop-shadow(0 0 5px rgba(255,255,255,0.8)) drop-shadow(0 0 10px rgba(255,255,255,0.6)) drop-shadow(0 0 15px rgba(255,255,255,0.4))"
                          : "none",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Wishlist
                </button>
                <button
                  className="flex-[2] bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  style={{
                    boxShadow:
                      "0 4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  ADD TO CART
                </button>
              </div>

              {/* Key Highlights */}
              <div className="py-6">
                <h3 className="text-xl font-medium text-gray-900 mb-8">
                  Key Highlights
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="pb-4 border-b border-gray-400">
                    <span className="block text-sm text-gray-500 mb-1">
                      Gender
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {product.keyHighlights.gender}
                    </span>
                  </div>
                  <div className="pb-4 border-b border-gray-400">
                    <span className="block text-sm text-gray-500 mb-1">
                      Category
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {product.keyHighlights.category}
                    </span>
                  </div>
                  <div className="pb-4 border-b border-gray-400">
                    <span className="block text-sm text-gray-500 mb-1">
                      Type
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {product.keyHighlights.type}
                    </span>
                  </div>
                  <div className="pb-4 border-b border-gray-400">
                    <span className="block text-sm text-gray-500 mb-1">
                      Fit
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {product.keyHighlights.fit}
                    </span>
                  </div>
                  <div className="pb-4 border-b border-gray-400">
                    <span className="block text-sm text-gray-500 mb-1">
                      Closure
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {product.keyHighlights.closure}
                    </span>
                  </div>
                  <div className="pb-4 border-b border-gray-400">
                    <span className="block text-sm text-gray-500 mb-1">
                      Length
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {product.keyHighlights.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="py-6">
                <h3 className="text-xl font-medium text-gray-900 mb-8">
                  Product Information
                </h3>
                <div className="space-y-3">
                  {/* Product Description */}
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection("description")}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="font-medium">Product Description</span>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          expandedSection === "description" ? "rotate-180" : ""
                        }`}
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
                    </button>
                    {expandedSection === "description" && (
                      <div className="px-4 pb-4 text-sm text-gray-600">
                        Manufacture, Care and Fit
                      </div>
                    )}
                  </div>

                  {/* Shipping Info */}
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection("shipping")}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <span className="font-medium">Shipping Info</span>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          expandedSection === "shipping" ? "rotate-180" : ""
                        }`}
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
                    </button>
                    {expandedSection === "shipping" && (
                      <div className="px-4 pb-4 text-sm text-gray-600">
                        We Offer free shipping across India
                      </div>
                    )}
                  </div>

                  {/* Returns & Exchange */}
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection("returns")}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span className="font-medium">
                          7 Days Returns & Exchange
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          expandedSection === "returns" ? "rotate-180" : ""
                        }`}
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
                    </button>
                    {expandedSection === "returns" && (
                      <div className="px-4 pb-4 text-sm text-gray-600">
                        Know about return & exchange policy
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Reviews */}
              <div className="py-6">
                <h3 className="text-xl font-medium text-gray-900 mb-8">
                  Customer Reviews
                </h3>
                <div className="text-sm text-gray-600 mb-3">
                  Based on 196 reviews
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= 4
                              ? "text-black animate-pulse-glow"
                              : "text-gray-400"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          style={{
                            filter:
                              star <= 4
                                ? "drop-shadow(0 0 2px rgba(255,255,255,0.6))"
                                : "none",
                          }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      4.0 out of 5
                    </span>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 hover:bg-blue-700"
                    style={{
                      boxShadow:
                        "0 4px 8px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    Write a review
                  </button>
                </div>

                {/* Review Summary */}
                <div className="space-y-3 mt-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const counts = { 5: 120, 4: 45, 3: 20, 2: 8, 1: 3 };
                    const percentage = (counts[rating] / 196) * 100;
                    return (
                      <div
                        key={rating}
                        className="flex items-center gap-4 text-sm"
                      >
                        <span className="w-8 text-black font-medium">
                          {rating} ★
                        </span>
                        <div className="flex-1 bg-gray-300 rounded-full h-3">
                          <div
                            className="bg-black h-3 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-black font-medium text-right">
                          {counts[rating]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Written Reviews */}
                <div className="mt-6 space-y-6">
                  <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-4 h-4 text-black"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-black">
                        Rahul K.
                      </span>
                      <span className="text-sm text-gray-600">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Amazing quality! The fabric is soft and the fit is
                      perfect. Highly recommend this product.
                    </p>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4].map((star) => (
                          <svg
                            key={star}
                            className="w-4 h-4 text-black"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-black">
                        Priya S.
                      </span>
                      <span className="text-sm text-gray-600">1 week ago</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Good product overall. The size runs a bit large, so
                      consider ordering one size smaller.
                    </p>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-4 h-4 text-black"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-black">
                        Arjun M.
                      </span>
                      <span className="text-sm text-gray-600">2 weeks ago</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Excellent purchase! Fast delivery and great customer
                      service. Will definitely buy again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flicker {
          0% {
            opacity: 1;
            filter: drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 10px #ffffff)
              drop-shadow(0 0 20px #ffffff);
          }
          5% {
            opacity: 0.8;
            filter: none;
          }
          10% {
            opacity: 1;
            filter: drop-shadow(0 0 15px #ffffff);
          }
          20% {
            opacity: 0.6;
            filter: none;
          }
          30% {
            opacity: 1;
            filter: drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 20px #ffffff);
          }
          70% {
            opacity: 0.9;
            filter: drop-shadow(0 0 5px #ffffff);
          }
          90% {
            opacity: 0.7;
            filter: none;
          }
          100% {
            opacity: 1;
            filter: drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 10px #ffffff)
              drop-shadow(0 0 20px #ffffff);
          }
        }

        .animate-flicker {
          animation: flicker 4s infinite;
        }

        @keyframes reflection {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-reflection {
          animation: reflection 0.6s ease-out;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ProductPage;
