import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronDown, MapPin, CreditCard, User, Package, AlertTriangle, RefreshCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-500', bg: 'bg-amber-500/10 text-amber-500' },
  { value: 'PAID', label: 'Paid', color: 'bg-indigo-500', bg: 'bg-indigo-500/10 text-indigo-500' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-blue-500', bg: 'bg-blue-500/10 text-blue-500' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-500', bg: 'bg-emerald-500/10 text-emerald-500' },
  { value: 'CANCELED', label: 'Cancelled', color: 'bg-red-500', bg: 'bg-red-500/10 text-red-500' },
];

const OrdersTab = ({ API_BASE, searchTerm, darkMode, refreshKey }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const dm = darkMode;
  const cardCls = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [API_BASE, refreshKey]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = (o.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const updateStatus = async (orderId, newStatus) => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchOrders();
    } catch (err) { console.error(err); }
    finally { setUpdatingId(null); }
  };

  const openDetail = async (orderId) => {
    setSelectedOrder(orderId);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrderDetail(data.order);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const getStatusStyle = (status) => STATUS_OPTIONS.find(s => s.value === status)?.bg || 'bg-gray-500/10 text-gray-500';

  if (loading && orders.length === 0) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={`w-8 h-8 border-2 rounded-full ${dm ? 'border-indigo-500 border-t-transparent' : 'border-black border-t-transparent'}`} /></div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? (dm ? 'bg-white text-black' : 'bg-black text-white') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100')}`}>All ({orders.length})</button>
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s.value).length;
          return <button key={s.value} onClick={() => setFilterStatus(s.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s.value ? (dm ? 'bg-white text-black' : 'bg-black text-white') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100')}`}>{s.label} ({count})</button>;
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <motion.div key={order.id} layout className={`${cardCls} p-5 cursor-pointer hover:shadow-lg transition-all`} onClick={() => openDetail(order.id)}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center ${dm ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}><ShoppingBag size={18} /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusStyle(order.status)}`}>{order.status}</span>
                  </div>
                  <p className={`text-[11px] font-medium mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                    {order.user?.fullName || 'Unknown'} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length || 0} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <p className="text-lg font-bold">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                <select value={order.status} onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  disabled={updatingId === order.id}
                  className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border-none cursor-pointer focus:ring-2 focus:ring-indigo-500/30 ${dm ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'} ${updatingId === order.id ? 'opacity-50' : ''}`}
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {/* Items preview */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {(order.items || []).slice(0, 4).map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg flex-shrink-0 text-[10px] font-medium ${dm ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                  <span>{item.product?.name || 'Item'}</span>
                  <span className={dm ? 'text-gray-600' : 'text-gray-300'}>×{item.quantity}</span>
                </div>
              ))}
              {(order.items || []).length > 4 && <span className={`text-[10px] font-medium self-center ${dm ? 'text-gray-600' : 'text-gray-400'}`}>+{order.items.length - 4} more</span>}
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className={`${cardCls} py-16 text-center`}>
            <AlertTriangle size={36} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`text-sm font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className={`w-full max-w-lg h-full overflow-y-auto p-6 ${dm ? 'bg-[#0e0e10]' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Order Details</h2>
                <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className={`p-2 rounded-xl ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><X size={18} /></button>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center h-40"><RefreshCcw size={20} className="animate-spin text-gray-400" /></div>
              ) : orderDetail ? (
                <div className="space-y-6">
                  {/* Order Header */}
                  <div className={`p-4 rounded-2xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-bold mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>ORDER ID</p>
                    <p className="text-sm font-bold font-mono">{orderDetail.id}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusStyle(orderDetail.status)}`}>{orderDetail.status}</span>
                      <span className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(orderDetail.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Customer */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User size={14} className={dm ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={`text-xs font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Customer</span>
                    </div>
                    <div className={`p-4 rounded-2xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <p className="text-sm font-bold">{orderDetail.user?.fullName}</p>
                      <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{orderDetail.user?.email}</p>
                      {orderDetail.user?.phone && <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{orderDetail.user.phone}</p>}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {orderDetail.shippingAddress && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className={dm ? 'text-gray-500' : 'text-gray-400'} />
                        <span className={`text-xs font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Shipping Address</span>
                      </div>
                      <div className={`p-4 rounded-2xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className="text-sm font-medium">{orderDetail.shippingAddress.fullName}</p>
                        <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{orderDetail.shippingAddress.line1}{orderDetail.shippingAddress.line2 && `, ${orderDetail.shippingAddress.line2}`}</p>
                        <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state} {orderDetail.shippingAddress.postalCode}</p>
                        {orderDetail.shippingAddress.phone && <p className={`text-xs mt-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>📞 {orderDetail.shippingAddress.phone}</p>}
                      </div>
                    </div>
                  )}

                  {/* Payment */}
                  {orderDetail.payment && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard size={14} className={dm ? 'text-gray-500' : 'text-gray-400'} />
                        <span className={`text-xs font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Payment</span>
                      </div>
                      <div className={`p-4 rounded-2xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{orderDetail.payment.method}</span>
                          <span className={`font-bold ${orderDetail.payment.status === 'SUCCESS' ? 'text-emerald-500' : orderDetail.payment.status === 'FAILED' ? 'text-red-500' : 'text-amber-500'}`}>{orderDetail.payment.status}</span>
                        </div>
                        <p className={`text-xs mt-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Amount: ₹{parseFloat(orderDetail.payment.amount).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={14} className={dm ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={`text-xs font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Items ({orderDetail.items?.length || 0})</span>
                    </div>
                    <div className="space-y-2">
                      {(orderDetail.items || []).map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                          {item.product?.imageUrl ? <img src={item.product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dm ? 'bg-white/5' : 'bg-gray-200'}`}><Package size={14} /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{item.product?.name}</p>
                            <p className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Size: {item.size} • Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold flex-shrink-0">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className={`p-4 rounded-2xl border-2 ${dm ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${dm ? 'text-gray-300' : 'text-gray-600'}`}>Total Amount</span>
                      <span className="text-xl font-bold text-indigo-500">₹{parseFloat(orderDetail.total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-center text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Failed to load order details</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersTab;
