import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'badge-pending', step: 0 },
  PAID: { label: 'Confirmed', color: 'badge-paid', step: 1 },
  SHIPPED: { label: 'Shipped', color: 'badge-shipped', step: 2 },
  DELIVERED: { label: 'Delivered', color: 'badge-delivered', step: 3 },
  CANCELED: { label: 'Canceled', color: 'badge-canceled', step: -1 },
};

function TrackingMap({ status }) {
  const isCanceled = status === 'CANCELED';
  const progress = status === 'PENDING' ? 0.1 : status === 'PAID' ? 0.4 : status === 'SHIPPED' ? 0.75 : 1;
  
  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-3xl overflow-hidden mb-6 group/map border border-white/10 shadow-2xl">
      {/* Real Map Background */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-luminosity" 
        style={{ backgroundImage: 'url(/tracking_map.png)' }} 
      />
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
        {/* Route Line */}
        <path 
          d="M 50 150 Q 200 50 350 150" 
          fill="none" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="3" 
          strokeDasharray="8 8" 
        />
        
        {/* Progress Line */}
        {!isCanceled && (
          <motion.path 
            d="M 50 150 Q 200 50 350 150" 
            fill="none" 
            stroke="white" 
            strokeWidth="3" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* Origin Hub */}
        <circle cx="50" cy="150" r="6" fill="#10b981" />
        <circle cx="50" cy="150" r="10" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.3" />
        <text x="40" y="175" fill="white" fontSize="10" className="font-mono opacity-50 uppercase tracking-tighter">AURA_WH_X1</text>

        {/* Current Position Marker */}
        {!isCanceled && progress < 1 && (
          <motion.circle 
            r="5" 
            fill="white" 
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: `${progress * 100}%` }}
            style={{ offsetPath: "path('M 50 150 Q 200 50 350 150')" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* Destination Hub */}
        <circle cx="350" cy="150" r="6" fill={status === 'DELIVERED' ? '#10b981' : 'rgba(255,255,255,0.2)'} />
        <text x="320" y="175" fill="white" fontSize="10" className="font-mono opacity-50 uppercase tracking-tighter">DELIVERY_PT</text>
      </svg>
      
      {/* Location Tag */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] text-white font-mono uppercase tracking-[0.2em]">
            {isCanceled ? 'Tracking Stopped' : status === 'DELIVERED' ? 'Arrived' : 'In Transit'}
          </span>
        </div>
      </div>
    </div>
  );
}

function LogisticsLogs({ status, date }) {
  const baseDate = new Date(date);
  const logs = [
    { time: '09:12 AM', event: 'Order details received', location: 'Digital Hub', status: 'PAID' },
    { time: '11:45 AM', event: 'Package picked and packed', location: 'Warehouse A1', status: 'PAID' },
    { time: '02:30 PM', event: 'Sent to sorting facility', location: 'In Transit', status: 'SHIPPED' },
    { time: '05:20 PM', event: 'Out for delivery', location: 'Local Center', status: 'DELIVERED' },
  ];

  const currentStep = status === 'PENDING' ? 0 : status === 'PAID' ? 2 : status === 'SHIPPED' ? 3 : 4;

  return (
    <div className="mt-8">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Milestone Logs</h4>
      <div className="space-y-6">
        {logs.slice(0, currentStep).reverse().map((log, i) => (
          <div key={i} className="flex gap-4 group/log relative">
            {i < logs.slice(0, currentStep).length - 1 && (
              <div className="absolute left-[7px] top-6 bottom-[-24px] w-px bg-gray-100" />
            )}
            <div className={`w-3.5 h-3.5 rounded-full border-2 bg-white flex-shrink-0 z-10 transition-colors ${
              i === 0 ? 'border-gray-900 ring-4 ring-gray-900/5' : 'border-gray-200'
            }`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[11px] font-bold ${i === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{log.event}</span>
                <span className="text-[10px] font-mono text-gray-400">{log.time}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{log.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderTimeline({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const steps = ['Packed', 'Shipped', 'Regional', 'Delivered'];
  
  if (status === 'CANCELED') {
    return (
      <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest leading-none">Order Terminated</span>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress Trace</span>
        <span className="text-[10px] font-mono text-gray-900">{Math.round((config.step / 3) * 100)}%</span>
      </div>
      <div className="flex items-center gap-1 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gray-900 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(config.step / 3) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-3">
        {steps.map((step, i) => (
          <span key={step} className={`text-[9px] font-bold uppercase tracking-tighter ${
            i <= config.step ? 'text-gray-900' : 'text-gray-300'
          }`}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function AddressModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    line1: '', line2: '', city: '', state: '', postalCode: '', type: 'HOME', otherLabel: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to save address');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Delivery Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={async () => {
                if (!navigator.geolocation) return;
                setSaving(true);
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await res.json();
                    if (data.address) {
                      const addr = data.address;
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

                      // Highly aggressive PIN Code extraction
                      let detectedPin = addr.postcode?.replace(/\D/g, '').slice(0, 6);
                      if (data.display_name && (!detectedPin || !detectedPin.startsWith('1'))) {
                        const allPins = data.display_name.match(/\b\d{6}\b/g);
                        if (allPins && allPins.length > 0) detectedPin = allPins[0];
                      }

                      setFormData({
                        line1: line1Parts.join(', '),
                        line2: '',
                        city: cityCandidate || addr.village || '',
                        state: addr.state || '',
                        postalCode: detectedPin || '',
                        type: formData.type,
                        otherLabel: formData.otherLabel
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSaving(false);
                  }
                }, () => setSaving(false));
              }}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-600 transition-all flex items-center gap-1.5"
              title="Detect My Location"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Auto Detect</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            {['HOME', 'WORK', 'OTHER'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type }))}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                  formData.type === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Address Line 1</label>
              <input required type="text" value={formData.line1} onChange={e => setFormData(prev => ({ ...prev, line1: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-100 rounded-2xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all outline-none" placeholder="House No, Building, Street" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all outline-none" placeholder="City" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">PIN Code</label>
                <input required type="text" value={formData.postalCode} onChange={e => setFormData(prev => ({ ...prev, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all outline-none" placeholder="600001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">State</label>
                <input type="text" value={formData.state} onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all outline-none" placeholder="Karnataka" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Landmark (Opt)</label>
                <input type="text" value={formData.line2} onChange={e => setFormData(prev => ({ ...prev, line2: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all outline-none" placeholder="Near Apollo Hospital" />
              </div>
            </div>

            {formData.type === 'OTHER' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Custom Label (e.g. Parent's House)</label>
                <input required type="text" value={formData.otherLabel} onChange={e => setFormData(prev => ({ ...prev, otherLabel: e.target.value.slice(0, 17) }))}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all outline-none" placeholder="Enter custom name" maxLength={17} />
              </motion.div>
            )}
          </div>

          <button
            disabled={saving}
            type="submit"
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const { orders: allOrders } = useCart();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [originalFullName, setOriginalFullName] = useState(user?.fullName || user?.name || '');
  const [originalPhone, setOriginalPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('view') || 'profile';
  
  const setActiveTab = (tab) => {
    setSearchParams({ view: tab });
  };
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('active'); // 'active' or 'past'

  useEffect(() => {
    if (user) {
      const name = user.fullName || user.name || '';
      const phoneNum = user.phone || '';
      setFullName(name);
      setPhone(phoneNum);
      setOriginalFullName(name);
      setOriginalPhone(phoneNum);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSavedAddresses(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const validatePhone = (phoneNum) => {
    const cleanPhone = phoneNum.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSave = async () => {
    if (!validatePhone(phone)) return;
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone })
      });
      
      const data = await response.json();
      if (response.ok) {
        setOriginalFullName(fullName);
        setOriginalPhone(phone);
        updateUser({ ...user, fullName, phone, name: fullName });
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to update');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      id: 'addresses', 
      label: 'Addresses', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl sm:text-2xl font-bold">
                {(fullName || user?.name || '')?.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{fullName || user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                {message && (
                  <div className={`mb-5 p-3 rounded-xl text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message}
                  </div>
                )}
                
                {!phone && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Complete Your Profile 🎉</h3>
                    <p className="text-xs text-blue-700">Add your phone number to get started with orders.</p>
                  </div>
                )}

                <h2 className="text-base font-semibold text-gray-900 mb-5">{!phone ? 'Complete Your Profile' : 'Personal Information'}</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value.slice(0, 20))}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3.5 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                      Mobile Number {!phone && <span className="text-amber-500">(Required)</span>}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(value);
                        if (value.length > 0) validatePhone(value);
                      }}
                      placeholder="10-digit mobile number"
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                        phoneError ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading || !fullName || !phone || !!phoneError || (fullName === originalFullName && phone === originalPhone)}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => { logout(); window.location.href = '/'; }}
                    className="sm:hidden text-sm text-red-500 hover:text-red-700 transition-colors px-4 py-2.5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Order Stats Header */}
              {!ordersLoading && orders.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Active Deliveries</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => ['PENDING', 'PAID', 'SHIPPED'].includes(o.status)).length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Lifetime Spend</p>
                    <p className="text-2xl font-bold text-gray-900">₹{orders.reduce((sum, o) => sum + parseFloat(o.total), 0).toFixed(0)}</p>
                  </div>
                </div>
              )}

              {/* Sub-Tabs for Orders */}
              <div className="flex gap-4 border-b border-gray-100 mb-6">
                <button 
                  onClick={() => setOrderFilter('active')}
                  className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${
                    orderFilter === 'active' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Active Orders
                  {orderFilter === 'active' && <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                </button>
                <button 
                  onClick={() => setOrderFilter('past')}
                  className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${
                    orderFilter === 'past' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Order History
                  {orderFilter === 'past' && <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(orderFilter === 'active' 
                    ? orders.filter(o => ['PENDING', 'PAID', 'SHIPPED'].includes(o.status))
                    : orders.filter(o => ['DELIVERED', 'CANCELED'].includes(o.status))
                  ).length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-1">Queue Empty</h3>
                      <p className="text-xs text-gray-400 mb-6">No {orderFilter} orders found in your archive.</p>
                      <a href="/all-products" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-smooth">
                        Shop Now
                      </a>
                    </div>
                  ) : (
                    (orderFilter === 'active' 
                      ? orders.filter(o => ['PENDING', 'PAID', 'SHIPPED'].includes(o.status))
                      : orders.filter(o => ['DELIVERED', 'CANCELED'].includes(o.status))
                    ).map((order, idx) => {
                      const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                      const isExpanded = expandedOrder === order.id;
                      
                      return (
                        <div key={order.id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-gray-900 ring-4 ring-gray-900/5' : 'border-gray-100'}`}>
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="w-full p-6 text-left transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'SHIPPED' ? 'bg-blue-500 animate-pulse' : order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  <span className="text-[10px] font-mono text-gray-400 tracking-tighter uppercase whitespace-nowrap">ID_{order.id.slice(0, 8)}</span>
                                </div>
                                <p className="text-base font-bold text-gray-900 leading-tight">
                                  ₹{parseFloat(order.total).toFixed(0)} · <span className="text-gray-400">{order.itemCount} unit{order.itemCount > 1 ? 's' : ''}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{statusConfig.label}</p>
                                  <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Est. {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                  <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {!isExpanded && <OrderTimeline status={order.status} />}
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-8">
                                  {/* Map Visualization for Active Orders */}
                                  {order.status !== 'CANCELED' && (
                                    <TrackingMap status={order.status} />
                                  )}

                                  <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Left Side: Items and Details */}
                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Parcel Contents</h4>
                                      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 hide-scrollbar">
                                        {order.items.map(item => (
                                          <div key={item.id} className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                                            <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                              {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[8px] font-mono text-gray-300">NO_IMG</div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                              <div className="flex gap-2 mt-0.5">
                                                <span className="text-[9px] font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase">SIZE_{item.size}</span>
                                                <span className="text-[9px] font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase">QTY_{item.quantity}</span>
                                              </div>
                                            </div>
                                            <div className="text-right pr-2">
                                              <p className="text-xs font-bold text-gray-900">₹{parseFloat(item.price).toFixed(0)}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Delivery Estimate logic */}
                                      <div className="mt-8 p-4 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-900/10">
                                        <div className="flex justify-between items-start mb-4">
                                          <div>
                                            <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Delivery Address</p>
                                            <p className="text-[11px] font-medium leading-relaxed">
                                              {order.shippingAddress?.fullName}<br />
                                              {[order.shippingAddress?.line1, order.shippingAddress?.city].filter(Boolean).join(', ')}<br />
                                              {order.shippingAddress?.postalCode}
                                            </p>
                                          </div>
                                          <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-mono">PRIORITY_SHIP</div>
                                        </div>
                                        <div className="flex justify-between border-t border-white/10 pt-3">
                                          <span className="text-[11px] font-bold">Total Paid</span>
                                          <span className="text-[11px] font-bold">₹{parseFloat(order.total).toFixed(0)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Side: Detailed Logistics Log */}
                                    <div>
                                      {order.status !== 'CANCELED' ? (
                                        <LogisticsLogs status={order.status} date={order.createdAt} />
                                      ) : (
                                        <div className="h-full flex flex-col items-center justify-center p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
                                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </div>
                                          <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest mb-1">Shipment Terminated</h4>
                                          <p className="text-[10px] text-red-700">This order was canceled and tracking was disabled.</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Saved Addresses</h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Manage your delivery locations</p>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Address
                  </button>
                </div>

                {loading && savedAddresses.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">No saved addresses</p>
                    <p className="text-xs text-gray-500 mt-1">Add your home or work address for faster checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 hover:border-gray-200 transition-all flex justify-between items-start group relative">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${
                              addr.type === 'HOME' ? 'bg-blue-50 text-blue-600' :
                              addr.type === 'WORK' ? 'bg-amber-50 text-amber-600' :
                              'bg-indigo-50 text-indigo-600'
                            }`}>
                              {addr.type === 'HOME' ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth={2}/></svg>
                              ) : addr.type === 'WORK' ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2}/></svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth={2}/></svg>
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{addr.type === 'OTHER' ? (addr.otherLabel || 'OTHER') : addr.type}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{addr.line1}</p>
                          {addr.line2 && <p className="text-xs text-gray-500 mt-0.5">{addr.line2}</p>}
                          <p className="text-xs text-gray-500 mt-0.5">{[addr.city, addr.state].filter(Boolean).join(', ')} {addr.postalCode}</p>
                        </div>
                        <button 
                          onClick={() => deleteAddress(addr.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {showAddModal && (
              <AddressModal 
                onClose={() => setShowAddModal(false)} 
                onSuccess={() => {
                  fetchAddresses();
                  setShowAddModal(false);
                }} 
              />
            )}
          </AnimatePresence>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Profile;