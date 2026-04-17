import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClothingLoader from "../components/ClothingLoader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// Dynamic key highlights based on category/subcategory
function getKeyHighlights(product) {
  const cat = product.category?.name?.toLowerCase() || '';
  const sub = product.subcategory?.toLowerCase() || '';

  if (cat === 'sneakers') {
    return [
      { label: 'Upper Material', value: 'Premium Mesh & Synthetic' },
      { label: 'Sole', value: 'Rubber with EVA Cushioning' },
      { label: 'Closure', value: 'Lace-Up' },
      { label: 'Cushioning', value: 'Memory Foam Insole' },
      { label: 'Terrain', value: 'Indoor & Outdoor' },
      { label: 'Weight', value: 'Lightweight (~350g)' },
    ];
  }
  if (cat === 'upper wear') {
    if (sub === 'hoodies') return [
      { label: 'Material', value: '100% Cotton French Terry' },
      { label: 'Sleeve', value: 'Full Sleeve' },
      { label: 'Neckline', value: 'Hooded with Drawstring' },
      { label: 'Fit', value: 'Relaxed / Oversized' },
      { label: 'Pattern', value: 'Solid' },
      { label: 'Occasion', value: 'Casual / Streetwear' },
    ];
    if (sub === 'jackets') return [
      { label: 'Material', value: 'Polyester & Nylon Blend' },
      { label: 'Sleeve', value: 'Full Sleeve' },
      { label: 'Closure', value: 'Zip-Up' },
      { label: 'Fit', value: 'Regular Fit' },
      { label: 'Pattern', value: 'Solid' },
      { label: 'Occasion', value: 'Casual / Layering' },
    ];
    return [ // tshirts default
      { label: 'Material', value: '100% Combed Cotton' },
      { label: 'Sleeve', value: 'Half Sleeve' },
      { label: 'Neckline', value: 'Round Neck' },
      { label: 'Fit', value: 'Regular Fit' },
      { label: 'Pattern', value: 'Printed / Solid' },
      { label: 'Occasion', value: 'Casual / Everyday' },
    ];
  }
  if (cat === 'bottom wear') {
    if (sub === 'jeans') return [
      { label: 'Material', value: 'Stretchable Denim (98% Cotton)' },
      { label: 'Rise', value: 'Mid Rise' },
      { label: 'Leg Style', value: 'Slim / Tapered' },
      { label: 'Fit', value: 'Slim Fit' },
      { label: 'Closure', value: 'Button & Zip' },
      { label: 'Wash', value: 'Medium / Dark Wash' },
    ];
    if (sub === 'cargos') return [
      { label: 'Material', value: 'Cotton Twill' },
      { label: 'Rise', value: 'Mid Rise' },
      { label: 'Pockets', value: '6-Pocket Utility' },
      { label: 'Fit', value: 'Relaxed Fit' },
      { label: 'Closure', value: 'Drawstring & Elastic' },
      { label: 'Occasion', value: 'Casual / Streetwear' },
    ];
    if (sub === 'shorts') return [
      { label: 'Material', value: 'Cotton Blend' },
      { label: 'Rise', value: 'Mid Rise' },
      { label: 'Length', value: 'Above Knee' },
      { label: 'Fit', value: 'Regular Fit' },
      { label: 'Closure', value: 'Elastic Waistband' },
      { label: 'Occasion', value: 'Casual / Athletic' },
    ];
    return [
      { label: 'Material', value: 'Premium Cotton Blend' },
      { label: 'Rise', value: 'Mid Rise' },
      { label: 'Fit', value: 'Regular Fit' },
      { label: 'Closure', value: 'Button & Zip' },
      { label: 'Length', value: 'Full Length' },
      { label: 'Occasion', value: 'Casual / Everyday' },
    ];
  }
  // Generic fallback
  return [
    { label: 'Material', value: 'Premium Quality' },
    { label: 'Category', value: product.category?.name || 'Fashion' },
    { label: 'Type', value: product.subcategory || 'Apparel' },
    { label: 'Fit', value: 'Regular Fit' },
    { label: 'Pattern', value: 'Solid' },
    { label: 'Occasion', value: 'Casual' },
  ];
}

// Stars component
function StarRating({ rating, size = 'w-4 h-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${size} ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Interactive star selector
function StarSelector({ rating, onSelect }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onSelect(star)}
          className="p-0.5"
        >
          <svg className={`w-7 h-7 transition-colors ${star <= (hover || rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Time ago formatting
function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  // Lock body scroll on mount, restore on unmount
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToImage = (index) => {
    if (scrollRef.current) {
      const { clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: index * clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const isSneaker = product?.category?.name?.toLowerCase() === 'sneakers';
  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
  const sizes = isSneaker ? shoeSizes : clothingSizes;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
          setReviewStats(data.reviewStats);
          setIsWishlisted(isInWishlist(data.product.id));
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error loading product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/reviews?limit=10`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      setIsWishlisted(false);
    } else {
      setIsWishlisted(true);
      addToWishlist(product).then(success => {
        if (success === false) setIsWishlisted(false);
      });
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    setIsPressed(true);
    addToCart(product, selectedSize);
    setTimeout(() => setIsPressed(false), 1000);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      setReviewError('Please select a rating');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, title: reviewTitle, comment: reviewComment })
      });
      const data = await response.json();
      if (data.success) {
        setReviews(prev => [data.review, ...prev]);
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewTitle('');
        setReviewComment('');
        // Refresh stats
        const statsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
        const statsData = await statsRes.json();
        if (statsData.reviewStats) setReviewStats(statsData.reviewStats);
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Network error. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) return <ClothingLoader />;

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-smooth">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const highlights = getKeyHighlights(product);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden bg-gray-50/50">
      <div className="flex h-full">
        {/* Left Column: Fixed Image Gallery with Independent Scroll */}
        <div className="w-1/2 h-full border-r border-gray-100 flex flex-col p-6 lg:p-10 overflow-hidden relative">
          {/* Breadcrumb - Locked to Left Panel */}
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6 shrink-0">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            {product.category && (
              <>
                <Link to={`/${product.category.name.toLowerCase().replace(' ', '-')}`} className="hover:text-gray-900 transition-colors">
                  {product.category.name}
                </Link>
                <span className="opacity-30">/</span>
              </>
            )}
            <span className="text-gray-900 font-bold truncate max-w-[150px]">{product.name}</span>
          </nav>

          {/* Premium Snap-Scroll Image Gallery Wrapper */}
          <div className="relative group grow overflow-hidden">
            {/* Scrollable Gallery Container */}
            <motion.div
              ref={scrollRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar rounded-3xl border border-gray-200 bg-white"
            >
              {[product.imageUrl, ...(product.gallery || [])].filter(Boolean).map((img, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full flex items-center justify-center snap-start overflow-hidden p-8"
                >
                  <img 
                    src={img} 
                    alt={`${product.name} angle ${idx + 1}`} 
                    className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" 
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Vertical Dots Navigation - Persistent Overlay */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
              {[product.imageUrl, ...(product.gallery || [])].filter(Boolean).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => scrollToImage(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    activeIndex === idx ? 'bg-black scale-125' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Independently Scrollable Product Details */}
        <div className="w-1/2 h-full overflow-y-auto hide-scrollbar p-6 lg:p-12 xl:p-20 bg-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Name & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-bold text-gray-900">₹{parseFloat(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{parseFloat(product.originalPrice)}</span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-50 text-red-600 px-2.5 py-1 text-xs font-semibold rounded-full">
                    {Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}% OFF
                  </span>
                )}
              </div>
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={Math.round(reviewStats.averageRating)} />
                  <span className="text-sm text-gray-500">{reviewStats.averageRating} ({reviewStats.totalReviews} reviews)</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  {isSneaker ? 'Select Shoe Size' : 'Select Size'}
                </h3>
                {sizeError && (
                  <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-500 font-medium">
                    Please select a size
                  </motion.span>
                )}
              </div>
              <div className={`flex flex-wrap gap-2 ${sizeError ? 'animate-shake' : ''}`}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`px-4 py-2.5 border rounded-xl text-sm font-medium transition-all duration-200 ${selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : `border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 ${sizeError ? 'border-red-300' : ''}`
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {isSneaker && (
                <p className="text-xs text-gray-400 mt-2">Sizes shown in UK standard</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={toggleWishlist}
                className={`flex-1 py-3.5 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border ${isWishlisted
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
              >
                <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isPressed}
                className={`flex-[2] py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${isPressed
                    ? 'bg-gray-900 text-white scale-95'
                    : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                  }`}
              >
                {isPressed ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Key Highlights */}
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Key Highlights</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {highlights.map((h, i) => (
                  <div key={i} className="py-3 border-b border-gray-100">
                    <span className="block text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{h.label}</span>
                    <span className="text-sm font-medium text-gray-900">{h.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Information Accordions */}
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Product Information</h3>
              <div className="space-y-2">
                {[
                  {
                    key: 'description', 
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
                    label: 'Description & Care', 
                    content: (
                      <div className="space-y-3 text-sm text-gray-600">
                        <p>{product.description || 'Premium quality product crafted with attention to detail.'}</p>
                        <div>
                          <p className="font-medium text-gray-800 mb-1">Care Instructions:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Machine wash cold with like colors</li>
                            <li>Do not bleach or tumble dry</li>
                            <li>Iron on low heat if needed</li>
                            <li>Do not dry clean</li>
                          </ul>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'shipping', 
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>, 
                    label: 'Shipping & Delivery', 
                    content: (
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Free shipping across India</p>
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Estimated delivery: 5-7 business days</p>
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Express delivery available in select cities</p>
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Track your order in real-time</p>
                      </div>
                    )
                  },
                  {
                    key: 'returns', 
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>, 
                    label: '7-Day Returns & Exchange', 
                    content: (
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>We accept returns within 7 days of delivery for all unused items with original tags.</p>
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Free returns pickup</p>
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Exchange for different size available</p>
                        <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Refund processed within 5-7 business days</p>
                      </div>
                    )
                  },
                ].map(({ key, icon, label, content }) => (
                  <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{icon}</span>
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedSection === key ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expandedSection === key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">{content}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Customer Reviews</h3>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
                      return;
                    }
                    setShowReviewForm(!showReviewForm);
                  }}
                  className="text-sm font-medium text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-smooth"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Stats */}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{reviewStats.averageRating}</div>
                      <StarRating rating={Math.round(reviewStats.averageRating)} />
                      <div className="text-xs text-gray-400 mt-1">{reviewStats.totalReviews} reviews</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviewStats.ratingCounts[rating] || 0;
                        const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-500 font-medium">{rating}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="bg-amber-400 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: (5 - rating) * 0.1 }}
                              />
                            </div>
                            <span className="w-6 text-gray-400 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Write Review Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <StarSelector rating={reviewRating} onSelect={setReviewRating} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Summarize your experience"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Tell others about your experience with this product..."
                          rows={3}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        />
                      </div>
                      {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-smooth"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          disabled={reviewSubmitting || !reviewRating}
                          className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-smooth disabled:opacity-50"
                        >
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length === 0 && !reviewStats?.totalReviews && (
                  <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first to review this product!</p>
                )}
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <StarRating rating={review.rating} />
                        {review.title && (
                          <h4 className="text-sm font-semibold text-gray-900 mt-1.5">{review.title}</h4>
                        )}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{review.user?.name}</span>
                      <span>·</span>
                      <span>{timeAgo(review.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default ProductPage;
