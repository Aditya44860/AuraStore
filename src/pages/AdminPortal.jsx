import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Search,
  ChevronRight,
  MoreVertical,
  LogOut,
  Trash2,
  ExternalLink,
  Download,
  AlertTriangle,
  RefreshCcw,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Custom Components ---

const AuraChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const width = 800;
  const height = 200;
  const padding = 40;

  const maxValue = Math.max(...data.map(d => d.revenue)) || 100;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: (1 - (d.revenue / maxValue)) * (height - padding * 2) + padding
  }));

  const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${path} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className="relative w-full h-[250px] bg-white rounded-3xl border border-gray-100/50 p-8 overflow-hidden group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold">Revenue Velocity</h3>
          <p className="text-xs text-gray-400 font-medium">Daily performance tracking (Last 14 days)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-black rounded-full" />
          <span className="text-xs font-bold text-gray-900">Total Sales</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[150px] overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line 
            key={i}
            x1={padding} y1={padding + p * (height - padding * 2)}
            x2={width - padding} y2={padding + p * (height - padding * 2)}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        <motion.path
          d={areaPath}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.path
          d={path}
          fill="none"
          stroke="black"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="black"
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.05 }}
            className="cursor-pointer transition-transform hover:scale-[2]"
          >
            <title>{`${data[i].date}: ₹${data[i].revenue}`}</title>
          </motion.circle>
        ))}
      </svg>
    </div>
  );
};

const ActionButton = ({ onClick, icon: Icon, label, variant = "ghost", loading = false }) => {
  const [confirm, setConfirm] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    setConfirm(false);
    onClick();
  };

  const baseStyles = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300";
  const variants = {
    ghost: "text-gray-400 hover:text-black hover:bg-gray-100",
    danger: confirm ? "bg-red-500 text-white shadow-lg shadow-red-100" : "text-gray-400 hover:text-red-500 hover:bg-red-50",
    primary: "bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200"
  };

  return (
    <button onClick={handleClick} className={`${baseStyles} ${variants[variant]}`} disabled={loading}>
      {loading ? (
        <RefreshCcw size={14} className="animate-spin" />
      ) : (
        <>
          <Icon size={14} />
          {confirm ? "Confirm?" : label}
        </>
      )}
    </button>
  );
};

// --- Main Page ---

const AdminPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, usersRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/admin/orders`),
        fetch(`${API_BASE}/api/admin/products`),
        fetch(`${API_BASE}/api/admin/users-detailed`),
        fetch(`${API_BASE}/api/admin/revenue-history`)
      ]);
      
      const [s, o, p, u, h] = await Promise.all([
        statsRes.json(), ordersRes.json(), productsRes.json(), usersRes.json(), historyRes.json()
      ]);

      if (s.success) setStats(s.stats);
      if (o.success) setOrders(o.orders);
      if (p.success) setProducts(p.products);
      if (u.success) setUsers(u.users);
      if (h.success) setRevenueHistory(h.history);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
  ];

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 bg-white sticky top-0 h-screen flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg italic">A</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">AuraStack</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-500 ${
                  activeTab === item.id 
                    ? 'bg-black text-white shadow-xl shadow-gray-200' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-black transition-colors"
          >
            <LogOut size={18} />
            Back to Store
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 capitalize">{activeTab}</h1>
            <p className="text-gray-400 text-sm font-medium">System operational. Database synced {new Date().toLocaleTimeString()}.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Live search records..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-black/5 transition-all w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchData}
              className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 hover:rotate-180 transition-all duration-500 shadow-sm"
            >
              <RefreshCcw size={18} className="text-gray-600" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Gross Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
                  { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
                  { label: 'Inventory Size', value: stats?.totalProducts, icon: Package, color: 'text-purple-500' },
                  { label: 'Admin/Users', value: stats?.totalUsers, icon: Users, color: 'text-orange-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-2xl bg-gray-50 ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1.5 rounded-full uppercase tracking-widest">
                        Live
                      </span>
                    </div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <AuraChart data={revenueHistory} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Card */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100/50 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold">Latest Transactions</h2>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                      Audit All <ChevronRight size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{order.user.fullName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.status} • ₹{parseFloat(order.total).toLocaleString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="p-2 text-gray-300 hover:text-black transition-colors"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-[32px] border border-gray-100/50 shadow-sm p-8">
                  <h2 className="text-xl font-bold mb-8">Order Logistics</h2>
                  <div className="space-y-6">
                    {stats?.statusDistribution.map((dist) => (
                      <div key={dist.status}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dist.status}</span>
                          <span className="text-xs font-bold">{Math.round((dist._count / (stats.totalOrders || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(dist._count / (stats.totalOrders || 1)) * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full ${
                              dist.status === 'DELIVERED' ? 'bg-emerald-500' :
                              dist.status === 'SHIPPED' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Catalog Management</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportToCSV(products, 'inventory-export')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                    <Plus size={14} /> Add Product
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100/50 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Listing</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Retail</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover bg-gray-50 shadow-sm" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{product.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">ID: {product.id.slice(0,8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-lg">
                            {product.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                            <p className="text-sm font-bold">{product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-gray-900">₹{parseFloat(product.price).toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={() => navigate(`/product/${product.id}`)}
                              className="p-2 text-gray-400 hover:text-black transition-colors"
                            >
                              <ExternalLink size={16} />
                            </button>
                            <ActionButton 
                              onClick={() => handleDeleteProduct(product.id)}
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              loading={deletingId === product.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">User Ecosystem</h2>
                <button 
                  onClick={() => exportToCSV(users, 'user-audit')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Download size={14} /> Audit Report
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100/50 shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                    <div key={user.id} className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-500 group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {user.fullName[0]}
                        </div>
                        <ActionButton 
                          onClick={() => handleDeleteUser(user.id)}
                          icon={Trash2}
                          variant="danger"
                          loading={deletingId === user.id}
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{user.fullName}</h3>
                      <p className="text-xs text-gray-400 font-medium mb-4">{user.email}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                          <p className="text-sm font-bold text-black font-mono">₹{user.totalSpend.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                          <p className="text-sm font-bold text-black">{user.orderCount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {users.length === 0 && (
                  <div className="py-20 text-center">
                    <AlertTriangle size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No users synchronized</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="space-y-6"
            >
              {orders.filter(o => o.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((order) => (
                <div key={order.id} className="bg-white rounded-[32px] border border-gray-100/50 shadow-sm p-8 hover:shadow-xl transition-all duration-500 group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <ShoppingBag size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">INV-{order.id.slice(0,8).toUpperCase()}</h3>
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">PAID</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{new Date(order.createdAt).toLocaleString()} • {order.user.fullName}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-12">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Yield</p>
                        <p className="text-xl font-bold font-mono">₹{parseFloat(order.total).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Workflow Status</p>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-2xl border-none focus:ring-4 focus:ring-black/5 cursor-pointer shadow-sm ${
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                            'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <option value="PENDING">Hold / Pending</option>
                          <option value="SHIPPED">Dispatched</option>
                          <option value="DELIVERED">Settled / Delivered</option>
                          <option value="CANCELED">Archived / Canceled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8 border-t border-gray-50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex items-center justify-center font-bold text-[10px] italic">
                          A
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{item.product.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">QTY: {item.quantity} • {item.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminPortal;
