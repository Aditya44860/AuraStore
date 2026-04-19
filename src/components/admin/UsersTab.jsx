import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Download, Trash2, AlertTriangle, RefreshCcw, Mail, Calendar } from 'lucide-react';

const UsersTab = ({ API_BASE, searchTerm, darkMode, refreshKey }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const dm = darkMode;
  const cardCls = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users-detailed`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [API_BASE, refreshKey]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleDelete = async (id) => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchUsers();
      else alert(data.message);
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const exportUsers = () => {
    const headers = 'Name,Email,Orders,Total Spend,Joined\n';
    const rows = users.map(u => `"${u.fullName}","${u.email}",${u.orderCount},${u.totalSpend},"${new Date(u.joinedAt).toLocaleDateString('en-IN')}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customers-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const totalSpend = useMemo(() => users.reduce((s, u) => s + u.totalSpend, 0), [users]);
  const avgSpend = users.length > 0 ? totalSpend / users.length : 0;

  if (loading && users.length === 0) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={`w-8 h-8 border-2 rounded-full ${dm ? 'border-indigo-500 border-t-transparent' : 'border-black border-t-transparent'}`} /></div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Customers', value: users.length, icon: Users, accent: 'text-violet-500' },
          { label: 'Total Lifetime Value', value: `₹${totalSpend.toLocaleString('en-IN')}`, icon: ShoppingBag, accent: 'text-emerald-500' },
          { label: 'Avg. Spend per User', value: `₹${Math.round(avgSpend).toLocaleString('en-IN')}`, icon: Users, accent: 'text-blue-500' },
        ].map((s, i) => (
          <div key={i} className={`${cardCls} p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-xl ${s.accent} ${dm ? 'bg-white/5' : 'bg-gray-50'}`}><s.icon size={16} /></div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button onClick={exportUsers} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${dm ? 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}><Download size={14} />Export CSV</button>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredUsers.map((user, i) => (
          <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`${cardCls} p-5 group hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${dm ? 'bg-indigo-500/10 text-indigo-400' : 'bg-black text-white'}`}>
                {user.fullName[0]?.toUpperCase()}
              </div>
              <button onClick={() => handleDelete(user.id)} disabled={deletingId === user.id}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100 ${confirmDeleteId === user.id ? (dm ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-500') : (dm ? 'text-gray-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50')}`}>
                {deletingId === user.id ? <RefreshCcw size={14} className="animate-spin" /> : confirmDeleteId === user.id ? 'Confirm?' : <Trash2 size={14} />}
              </button>
            </div>

            <h3 className="font-bold text-sm mb-0.5">{user.fullName}</h3>
            <div className={`flex items-center gap-1.5 text-[11px] mb-4 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
              <Mail size={11} />{user.email}
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${dm ? 'border-white/5' : 'border-gray-100'}`}>
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Lifetime Value</p>
                <p className="text-sm font-bold">₹{user.totalSpend.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Orders</p>
                <p className="text-sm font-bold">{user.orderCount}</p>
              </div>
              <div className="text-right">
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Joined</p>
                <p className={`text-[11px] font-medium ${dm ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className={`${cardCls} py-16 text-center`}>
          <AlertTriangle size={36} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className={`text-sm font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{searchTerm ? 'No customers match your search' : 'No customers registered yet'}</p>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
