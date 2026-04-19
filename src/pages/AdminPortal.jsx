import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, CreditCard,
  Star, Settings, LogOut, Search, Bell, Moon, Sun, Menu,
  RefreshCcw, Lock, ArrowLeft, ChevronLeft, X, AlertCircle,
  CheckCircle2, Info, TrendingUp
} from 'lucide-react';
import DashboardTab from '../components/admin/DashboardTab';
import ProductsTab from '../components/admin/ProductsTab';
import OrdersTab from '../components/admin/OrdersTab';
import UsersTab from '../components/admin/UsersTab';
import PaymentsTab from '../components/admin/PaymentsTab';
import ReviewsTab from '../components/admin/ReviewsTab';
import SettingsTab from '../components/admin/SettingsTab';
import NotificationsTab from '../components/admin/NotificationsTab';

const ADMIN_PASSWORD_KEY = 'aura_admin_pass';
const DEFAULT_PASSWORD = 'aura999';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState(
    () => localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASSWORD
  );
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem('aura_admin_auth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('aura_admin_dark') !== 'false'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!authenticated) return;
    const fetchNavNotes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/notifications`);
        const data = await res.json();
        if (data.success) {
          const localRead = JSON.parse(localStorage.getItem('aura_admin_read_notifs') || '[]');
          const hidden = JSON.parse(localStorage.getItem('aura_admin_hidden_notifs') || '[]');
          
          const formatTime = (dStr) => {
            const diff = new Date() - new Date(dStr);
            const m = Math.floor(diff / 60000);
            const h = Math.floor(m / 60);
            if (h >= 24) return `${Math.floor(h/24)}d ago`;
            if (h > 0) return `${h}h ago`;
            if (m > 0) return `${m}m ago`;
            return 'Just now';
          };
          
          const validNotes = data.notifications
            .filter(n => !hidden.includes(n.id))
            .map(n => ({ ...n, time: formatTime(n.time), read: localRead.includes(n.id) }));
            
          setNotifications(validNotes);
        }
      } catch (e) {}
    };
    fetchNavNotes();
    const intv = setInterval(fetchNavNotes, 30000);
    return () => clearInterval(intv);
  }, [authenticated, API_BASE, refreshKey]);

  useEffect(() => { 
    localStorage.setItem('aura_admin_dark', darkMode); 
    document.body.style.backgroundColor = darkMode ? '#0a0a0b' : '#f5f5f7';
    return () => { document.body.style.backgroundColor = ''; };
  }, [darkMode]);

  // Close bell on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Clear search when switching tabs
  useEffect(() => { setSearchTerm(''); }, [activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === adminPassword) {
      setAuthenticated(true);
      localStorage.setItem('aura_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
      setTimeout(() => setAuthError(''), 3000);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('aura_admin_auth');
    setPassword('');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
  };
  const dismissNotif = (id) => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
  };

  /* ─── Search placeholder per tab ─── */
  const searchPlaceholders = {
    dashboard: null,
    products: 'Search products...',
    orders: 'Search orders...',
    users: 'Search customers...',
    payments: 'Search transactions...',
    reviews: 'Search reviews...',
    settings: null,
  };
  const showSearch = searchPlaceholders[activeTab] !== null;

  /* ─── Login Gate ─── */
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/10">
              <span className="text-black font-black text-2xl italic">A</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AuraStore</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Admin Command Center</p>
          </div>
          <div className="bg-[#141416] border border-white/5 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1d] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600" autoFocus />
                </div>
              </div>
              {authError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-medium text-center">{authError}</motion.p>}
              <button type="submit" className="w-full py-3.5 bg-white text-black font-bold text-sm rounded-2xl hover:bg-gray-100 transition-all shadow-xl shadow-white/5 active:scale-[0.98]">Authenticate</button>
              <p className="text-[11px] text-gray-500 text-center mt-3 font-medium tracking-wide">Default password: <span className="font-bold text-white">aura999</span></p>
            </form>
            <button onClick={() => navigate('/')} className="w-full mt-4 py-3 text-gray-600 text-xs font-medium hover:text-white transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={14} />Back to Store
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Sidebar Items ─── */
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const tabDescriptions = {
    dashboard: 'Real-time business overview',
    products: 'Manage catalog & inventory',
    orders: 'Track & process orders',
    users: 'Customer management',
    payments: 'Transaction history',
    reviews: 'Customer feedback moderation',
    notifications: 'System alerts & updates',
    settings: 'Store configuration',
  };

  const renderContent = () => {
    const p = { API_BASE, searchTerm, darkMode, refreshKey };
    switch (activeTab) {
      case 'dashboard': return <DashboardTab {...p} setActiveTab={setActiveTab} />;
      case 'products': return <ProductsTab {...p} />;
      case 'orders': return <OrdersTab {...p} />;
      case 'users': return <UsersTab {...p} />;
      case 'payments': return <PaymentsTab {...p} />;
      case 'reviews': return <ReviewsTab {...p} />;
      case 'notifications': return <NotificationsTab {...p} />;
      case 'settings': return <SettingsTab {...p} adminPassword={adminPassword} setAdminPassword={setAdminPassword} />;
      default: return <DashboardTab {...p} setActiveTab={setActiveTab} />;
    }
  };

  const dm = darkMode;

  return (
    <div className={`min-h-screen flex font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${dm ? 'bg-[#0a0a0b] text-white' : 'bg-[#f5f5f7] text-gray-900'}`}>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-40 flex flex-col border-r transition-all duration-300 ${dm ? 'bg-[#0e0e10] border-white/5' : 'bg-white border-gray-100'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        <div className={`p-5 ${sidebarCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${dm ? 'bg-white' : 'bg-black'}`}>
              <span className={`font-black text-base italic ${dm ? 'text-black' : 'text-white'}`}>A</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base tracking-tight block">AuraStore</span>
                <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Admin</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 space-y-0.5 mt-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-3.5 py-2.5'} ${isActive ? (dm ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-black text-white shadow-sm') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent')}`}
              >
                <item.icon size={17} className="flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className={`p-3 border-t space-y-0.5 ${dm ? 'border-white/5' : 'border-gray-100'}`}>
          {!sidebarCollapsed && (
            <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
              <ArrowLeft size={16} />Back to Store
            </button>
          )}
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 ${sidebarCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3.5 py-2.5'}`}>
            <LogOut size={16} />{!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className={`sticky top-0 z-20 border-b px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-xl ${dm ? 'bg-[#0a0a0b]/90 border-white/5' : 'bg-[#f5f5f7]/90 border-gray-200/60'}`}>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-xl ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><Menu size={20} /></button>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`hidden lg:flex p-2 rounded-xl transition-all ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
              <ChevronLeft size={17} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold capitalize leading-tight">{activeTab}</h1>
              <p className={`text-[11px] font-medium hidden sm:block leading-none mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{tabDescriptions[activeTab]}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Contextual search */}
            <AnimatePresence>
              {showSearch && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="relative hidden md:block overflow-hidden">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${dm ? 'text-gray-600' : 'text-gray-400'}`} size={14} />
                  <input type="text" placeholder={searchPlaceholders[activeTab]} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 pr-10 py-2 w-44 lg:w-56 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${dm ? 'bg-white/5 border-white/5 text-white placeholder:text-gray-600' : 'bg-white border-gray-200 placeholder:text-gray-400'}`}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg ${dm ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}><X size={12} /></button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Refresh */}
            <button onClick={handleRefresh}
              className={`p-2 rounded-xl transition-all ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`} title="Refresh data">
              <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
                <RefreshCcw size={16} className={isRefreshing ? 'text-indigo-500' : (dm ? 'text-gray-500' : 'text-gray-400')} />
              </motion.div>
            </button>

            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button onClick={() => setBellOpen(!bellOpen)}
                className={`relative p-2 rounded-xl transition-all ${bellOpen ? (dm ? 'bg-white/10' : 'bg-gray-100') : (dm ? 'hover:bg-white/5' : 'hover:bg-gray-100')}`}>
                <Bell size={16} className={dm ? 'text-gray-500' : 'text-gray-400'} />
                {unreadCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {bellOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className={`absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100'}`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${dm ? 'border-white/5' : 'border-gray-100'}`}>
                      <span className="text-sm font-bold">Notifications</span>
                      <button onClick={markAllRead} className={`text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${dm ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}>Mark all read</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className={`text-center py-8 text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No notifications</p>
                      ) : notifications.slice(0, 15).map(n => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 transition-colors group ${n.read ? '' : (dm ? 'bg-indigo-500/5' : 'bg-indigo-50/50')} ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                          <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${n.read ? (dm ? 'bg-white/5 text-gray-600' : 'bg-gray-50 text-gray-400') : 'bg-indigo-500/10 text-indigo-500'}`}>
                            {n.type === 'order' && <ShoppingBag size={13} />}
                            {n.type === 'stock' && <AlertCircle size={13} />}
                            {n.type === 'review' && <Star size={13} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${n.read ? (dm ? 'text-gray-400' : 'text-gray-600') : (dm ? 'text-white' : 'text-gray-900')}`}>{n.message}</p>
                            <p className={`text-[10px] mt-0.5 ${dm ? 'text-gray-700' : 'text-gray-300'}`}>{n.time}</p>
                          </div>
                          <button onClick={() => dismissNotif(n.id)} className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${dm ? 'hover:bg-white/10 text-gray-600' : 'hover:bg-gray-100 text-gray-400'}`}><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                    <div className={`p-2 border-t ${dm ? 'border-white/5' : 'border-gray-100'}`}>
                      <button onClick={() => { setActiveTab('notifications'); setBellOpen(false); }} className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${dm ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}>View all activity</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark mode */}
            <button onClick={() => setDarkMode(!dm)} className={`p-2 rounded-xl transition-all ${dm ? 'hover:bg-white/5 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              {dm ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${dm ? 'bg-indigo-500/20 text-indigo-400' : 'bg-black text-white'}`}>A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
