import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Shipping', 'Payment', 'Review'];

function Confetti() {
  const colors = [
    '#FF3F8E', '#04C2C9', '#2E5BFF', '#F3A953', '#9658FE', 
    '#FFD700', '#FF1493', '#00FF7F', '#1E90FF', '#FF4500'
  ];
  const confettiCount = 100;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(confettiCount)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 400 + 200;
        const xDist = Math.cos(angle) * velocity;
        const yDist = Math.sin(angle) * velocity + 100; // gravity
        
        return (
          <motion.div
            key={i}
            initial={{ 
              top: '50%', 
              left: '50%',
              opacity: 1,
              scale: 0,
              rotate: 0,
              x: 0,
              y: 0
            }}
            animate={{ 
              opacity: [1, 1, 0],
              scale: [0, 1, 0.5],
              rotate: Math.random() * 1080,
              x: xDist,
              y: yDist
            }}
            transition={{ 
              duration: Math.random() * 1.5 + 1,
              ease: "easeOut",
              delay: Math.random() * 0.1
            }}
            className="absolute w-2 h-2"
            style={{ 
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              borderRadius: Math.random() > 0.5 ? '50%' : '1px'
            }}
          />
        );
      })}
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, isLoadingCart, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errors, setErrors] = useState({});

  const [shipping, setShipping] = useState({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', type: 'HOME', otherLabel: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (user) {
      setShipping(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
      fetchSavedAddresses();
    }
  }, [user]);

  // Proactive Location Detection
  useEffect(() => {
    if (currentStep === 0 && !shipping.line1) {
      handleDetectLocation();
    }
  }, []); // Run once on mount if no address exists

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSavedAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by your browser' }));
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Using OpenStreetMap Nominatim for Reverse Geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          
          // Precision Line 1 Construction
          const addressValues = Object.values(addr);
          const sectorMarker = addressValues.find(v => typeof v === 'string' && /sector|block|colony|enclave/i.test(v));
          
          const cityCandidate = addr.city || addr.town || addr.municipality || addr.county || addr.state_district;
          const villageName = addr.village || addr.suburb || addr.neighbourhood || addr.residential;

          const line1Parts = [
            addr.house_number || addr.building || addr.apartment || addr.amenity || addr.office || addr.shop,
            sectorMarker,
            villageName !== cityCandidate ? villageName : (addr.suburb || addr.neighbourhood || addr.locality || addr.city_district),
            cityCandidate,
            addr.state
          ].filter((v, i, a) => v && a.indexOf(v) === i);
          
          let fullLine1 = line1Parts.join(', ');

          // Fallback to display_name if constructed line is still empty
          if (!fullLine1 && data.display_name) {
            fullLine1 = data.display_name.split(',').slice(0, 3).join(',').trim();
          }

          // Highly aggressive PIN Code extraction
          let detectedPin = addr.postcode?.replace(/\D/g, '').slice(0, 6);
          
          // If the specific postcode field is missing or seems suspicious, scan the full display_name
          // SONIPAT/HARYANA pins start with 13
          if (data.display_name && (!detectedPin || !detectedPin.startsWith('1'))) {
            const allPins = data.display_name.match(/\b\d{6}\b/g);
            if (allPins && allPins.length > 0) {
              detectedPin = allPins[0]; // Take the first 6-digit number found
            }
          }

          setShipping(prev => ({
            ...prev,
            line1: fullLine1 || prev.line1,
            city: cityCandidate || addr.village || prev.city,
            state: addr.state || prev.state,
            postalCode: detectedPin || prev.postalCode
          }));
        }
      } catch (err) {
        console.error('Location detection failed:', err);
        setErrors(prev => ({ ...prev, location: 'Could not auto-detect precise address' }));
      } finally {
        setIsDetecting(false);
      }
    }, (error) => {
      setIsDetecting(false);
      setErrors(prev => ({ ...prev, location: 'Location access denied' }));
    });
  };

  const total = getCartTotal();
  const shippingCost = total >= 999 ? 0 : 99;
  const grandTotal = total + shippingCost;

  const handleShippingChange = useCallback((name, value) => {
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'postalCode') value = value.replace(/\D/g, '').slice(0, 6);
    if (name === 'otherLabel') value = value.slice(0, 17);
    setShipping(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName.trim()) e.fullName = 'Name is required';
    if (!shipping.phone || shipping.phone.replace(/\D/g, '').length !== 10) e.phone = 'Valid 10-digit phone required';
    if (!shipping.line1.trim()) e.line1 = 'Address is required';
    if (!shipping.city.trim()) e.city = 'City is required';
    if (!shipping.state.trim()) e.state = 'State is required';
    if (!shipping.postalCode || shipping.postalCode.replace(/\D/g, '').length !== 6) e.postalCode = 'Valid 6-digit PIN required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!validateShipping()) return;
      
      // Auto-save address if not already in saved ones
      const isAlreadySaved = savedAddresses.some(addr => 
        addr.line1 === shipping.line1 && 
        addr.postalCode === shipping.postalCode &&
        addr.type === shipping.type
      );

      if (!isAlreadySaved && isLoggedIn) {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(shipping)
          });
          fetchSavedAddresses(); // Refresh the list
        } catch (err) {
          console.error('Failed to auto-save address:', err);
        }
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ shippingAddress: shipping, paymentMethod })
      });
      const data = await response.json();
      if (data.success) {
        setCompletedOrder(data.order);
        setOrderComplete(true);
        clearCart();
      } else {
        setErrors({ submit: data.message || 'Order failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please login to proceed with checkout</p>
          <Link to="/login?from=/checkout" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-smooth inline-block">Login</Link>
        </div>
      </div>
    );
  }

  if (isLoadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!orderComplete && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add items to your cart before checkout</p>
          <Link to="/all-products" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-smooth inline-block">Shop Now</Link>
        </div>
      </div>
    );
  }

  if (orderComplete && completedOrder) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <Confetti />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-6">Your order has been successfully placed</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Order ID</span><span className="font-mono text-xs font-medium text-gray-900">{completedOrder.id.slice(0, 8).toUpperCase()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-semibold text-gray-900">₹{parseFloat(completedOrder.total).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="badge-paid text-xs px-2 py-0.5 rounded-full font-medium">Confirmed</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Est. Delivery</span><span className="text-gray-900 font-medium">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          </div>
          <div className="flex gap-3">
            <Link to="/profile?view=orders" className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-smooth text-center">View Orders</Link>
            <Link to="/" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-smooth text-center">Continue Shopping</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-smooth">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
          </div>
          <Link to="/"><img src="/final_logo_2.png" alt="AuraStore" className="h-7" /></Link>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${i <= currentStep ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{i < currentStep ? '✓' : i + 1}</span>
                  <span className="hidden sm:inline">{step}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-1 rounded-full transition-colors ${i < currentStep ? 'bg-gray-900' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping */}
              {currentStep === 0 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                      <h2 className="text-base font-semibold text-gray-900">Shipping Address</h2>
                      <button 
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold uppercase tracking-wider text-gray-700 transition-all disabled:opacity-50"
                      >
                        {isDetecting ? (
                          <div className="w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {isDetecting ? 'Detecting...' : 'Detect Location'}
                      </button>
                    </div>

                    {errors.location && (
                      <p className="text-[10px] text-red-500 mb-4 bg-red-50 p-2 rounded-lg">{errors.location}</p>
                    )}

                    {savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Saved Addresses</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr.id}
                              onClick={() => setShipping(prev => ({
                                ...prev,
                                line1: addr.line1,
                                line2: addr.line2 || '',
                                city: addr.city,
                                state: addr.state || '',
                                postalCode: addr.postalCode,
                                type: addr.type || 'HOME',
                                otherLabel: addr.otherLabel || ''
                              }))}
                              className="snap-start flex-shrink-0 w-48 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-900 hover:bg-white transition-all text-left group"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                  addr.type === 'HOME' ? 'bg-blue-100 text-blue-600' :
                                  addr.type === 'WORK' ? 'bg-amber-100 text-amber-600' :
                                  'bg-indigo-100 text-indigo-600'
                                }`}>
                                  {addr.type === 'OTHER' ? (addr.otherLabel || 'OTHER') : addr.type}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-900 truncate mb-1">{addr.line1}</p>
                              <p className="text-[10px] text-gray-500 truncate">{[addr.city, addr.postalCode].filter(Boolean).join(', ')}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <input type="text" value={shipping.fullName} onChange={(e) => handleShippingChange('fullName', e.target.value)} placeholder="John Doe"
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth ${errors.fullName ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`} />
                        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                      </div>
                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Phone</label>
                        <input type="tel" value={shipping.phone} onChange={(e) => handleShippingChange('phone', e.target.value)} placeholder="10-digit number"
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth ${errors.phone ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`} />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                      {/* Address Line 1 */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Address Line 1</label>
                        <input type="text" value={shipping.line1} onChange={(e) => handleShippingChange('line1', e.target.value)} placeholder="House/Flat No., Street"
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth ${errors.line1 ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`} />
                        {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
                      </div>
                      {/* Address Line 2 */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Address Line 2 (Optional)</label>
                        <input type="text" value={shipping.line2} onChange={(e) => handleShippingChange('line2', e.target.value)} placeholder="Landmark, Area"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth" />
                      </div>
                      {/* City */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">City</label>
                        <input type="text" value={shipping.city} onChange={(e) => handleShippingChange('city', e.target.value)} placeholder="City"
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth ${errors.city ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`} />
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                      </div>
                      {/* State */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">State</label>
                        <input type="text" value={shipping.state} onChange={(e) => handleShippingChange('state', e.target.value)} placeholder="State"
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth ${errors.state ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`} />
                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                      </div>
                      {/* PIN */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">PIN Code</label>
                        <input type="text" value={shipping.postalCode} onChange={(e) => handleShippingChange('postalCode', e.target.value)} placeholder="6-digit PIN"
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth ${errors.postalCode ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`} />
                        {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                      </div>
                      
                      {/* Address Type Selector */}
                      <div className="sm:col-span-2 mt-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Save Address As</label>
                        <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl w-full sm:w-72">
                          {['HOME', 'WORK', 'OTHER'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleShippingChange('type', type)}
                              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                                shipping.type === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {shipping.type === 'OTHER' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Custom Label (e.g. Parent's House)</label>
                          <input required type="text" value={shipping.otherLabel} onChange={(e) => handleShippingChange('otherLabel', e.target.value)} placeholder="Enter custom name" maxLength={17}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-smooth" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 1 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'CASH', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                        { id: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
                        { id: 'PAYPAL', label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm', icon: '📱' },
                      ].map(method => (
                        <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${paymentMethod === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{method.label}</div>
                            <div className="text-xs text-gray-400">{method.desc}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-gray-900' : 'border-gray-200'}`}>
                            {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    {paymentMethod !== 'CASH' && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl mt-4">💡 This is a demo store. No real payment will be processed.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 2 && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">Shipping To</h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">{shipping.fullName}</p>
                        <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}</p>
                        <p>{[shipping.city, shipping.state].filter(Boolean).join(', ')}{shipping.postalCode ? ` - ${shipping.postalCode}` : ''}</p>
                        <p>Phone: {shipping.phone}</p>
                      </div>
                      <button onClick={() => setCurrentStep(0)} className="text-xs text-gray-500 hover:text-gray-900 mt-2 underline">Edit</button>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">Order Items</h2>
                      <div className="space-y-3">
                        {cartItems.map(item => (
                          <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">Size: {item.size} · Qty: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {errors.submit && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">{errors.submit}</div>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6">
              {currentStep > 0 && (
                <button onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-smooth text-sm">Back</button>
              )}
              {currentStep < 2 ? (
                <button onClick={handleNext} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-smooth">
                  {currentStep === 0 ? 'Save & Continue' : 'Review Order'}
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-smooth text-sm disabled:opacity-50">
                  {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal.toFixed(0)}`}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={`s-${item.id}-${item.size}`} className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400">{item.size} · x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{total.toFixed(0)}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                {shippingCost > 0 && <p className="text-[11px] text-gray-400">Free shipping on orders above ₹999</p>}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>₹{grandTotal.toFixed(0)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;