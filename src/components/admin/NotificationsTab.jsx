import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingBag, AlertCircle, Star, CheckCircle2, RefreshCcw, Trash2, ExternalLink } from 'lucide-react';

const NotificationsTab = ({ API_BASE, darkMode, refreshKey }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const dm = darkMode;
  const cardCls = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/notifications`);
      const data = await res.json();
      if (data.success) {
        // Hydrate with local read state
        const localRead = JSON.parse(localStorage.getItem('aura_admin_read_notifs') || '[]');
        const hydrated = data.notifications.map(n => ({
          ...n,
          read: localRead.includes(n.id)
        }));
        setNotifications(hydrated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [API_BASE, refreshKey]);

  const toggleRead = (id, currentStatus) => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
    let newRead;
    if (currentStatus) {
      newRead = localRead.filter(x => x !== id);
    } else {
      newRead = [...localRead, id];
    }
    localStorage.setItem('aura_admin_read_notifs', JSON.stringify(newRead));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !currentStatus } : n));
  };

  const markAllRead = () => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
  };

  const clearAll = () => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const getIcon = (type) => {
    if (type === 'order') return <ShoppingBag size={15} />;
    if (type === 'stock') return <AlertCircle size={15} />;
    if (type === 'review') return <Star size={15} />;
    return <Bell size={15} />;
  };

  const getColor = (type, isRead) => {
    if (isRead) return dm ? 'text-gray-600 bg-white/5' : 'text-gray-400 bg-gray-50';
    if (type === 'order') return 'text-indigo-500 bg-indigo-500/10';
    if (type === 'stock') return 'text-rose-500 bg-rose-500/10';
    if (type === 'review') return 'text-amber-500 bg-amber-500/10';
    return 'text-indigo-500 bg-indigo-500/10';
  };

  const formatRelTime = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  };

  if (loading && notifications.length === 0) return <div className="flex justify-center py-20"><RefreshCcw className={`animate-spin ${dm ? 'text-gray-600' : 'text-gray-400'}`} /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'unread', 'order', 'stock', 'review'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? (dm ? 'bg-white text-black' : 'bg-black text-white') : (dm ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black')}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dm ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-black'}`}>Mark All Read</button>
          <button onClick={clearAll} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border text-red-500 hover:bg-red-500 hover:text-white ${dm ? 'border-red-500/20' : 'border-red-100'}`}><Trash2 size={13} className="inline mr-1 -mt-0.5" />Clear</button>
        </div>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={40} className={`mx-auto mb-4 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`text-sm font-medium ${dm ? 'text-gray-500' : 'text-gray-400'}`}>You're all caught up!</p>
          </div>
        ) : (
          <div className={`divide-y ${dm ? 'divide-white/5' : 'divide-gray-50'}`}>
            <AnimatePresence>
              {filtered.map((n) => (
                <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className={`flex flex-col sm:flex-row gap-4 p-4 hover:bg-opacity-50 transition-colors ${n.read ? '' : (dm ? 'bg-white/[0.02]' : 'bg-gray-50/50')} ${dm ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/80'}`}>
                  
                  <div className="flex flex-1 items-start gap-4">
                    <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${getColor(n.type, n.read)}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm md:text-base font-bold ${n.read ? (dm ? 'text-gray-500' : 'text-gray-700') : (dm ? 'text-white' : 'text-black')}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-indigo-400' : 'text-indigo-600'}`}>{n.type}</span>
                        <span className={`text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(n.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ({formatRelTime(n.time)})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center ml-12 sm:ml-0">
                    <button onClick={() => toggleRead(n.id, n.read)} className={`p-2 rounded-lg transition-all ${n.read ? (dm ? 'text-emerald-500 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-black hover:bg-gray-100')}`} title={n.read ? 'Mark as unread' : 'Mark as read'}>
                      <CheckCircle2 size={16} />
                    </button>
                    <button className={`p-2 rounded-lg transition-all ${dm ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`} title="View context source">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
