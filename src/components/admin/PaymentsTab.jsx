import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, AlertTriangle, CheckCircle2, XCircle, RefreshCcw, IndianRupee } from 'lucide-react';

const PaymentsTab = ({ API_BASE, searchTerm, darkMode, refreshKey }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const dm = darkMode;
  const cardCls = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/payments`);
        const data = await res.json();
        if (data.success) setPayments(data.payments);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPayments();
  }, [API_BASE, refreshKey]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = (p.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [payments, searchTerm, filterStatus]);

  const summary = useMemo(() => {
    const s = { total: 0, success: 0, failed: 0, refunded: 0, successAmt: 0, failedAmt: 0, refundedAmt: 0 };
    payments.forEach(p => {
      const amt = parseFloat(p.amount);
      s.total += amt;
      if (p.status === 'SUCCESS') { s.success++; s.successAmt += amt; }
      else if (p.status === 'FAILED') { s.failed++; s.failedAmt += amt; }
      else if (p.status === 'REFUNDED') { s.refunded++; s.refundedAmt += amt; }
    });
    return s;
  }, [payments]);

  const statusIcon = (status) => {
    if (status === 'SUCCESS') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'FAILED') return <XCircle size={14} className="text-red-500" />;
    return <RefreshCcw size={14} className="text-amber-500" />;
  };

  const statusBadge = (status) => {
    const styles = { SUCCESS: 'bg-emerald-500/10 text-emerald-500', FAILED: 'bg-red-500/10 text-red-500', REFUNDED: 'bg-amber-500/10 text-amber-500' };
    return styles[status] || 'bg-gray-500/10 text-gray-500';
  };

  const exportPayments = () => {
    const headers = 'ID,Customer,Method,Status,Amount,Date\n';
    const rows = payments.map(p => `"${p.id}","${p.user?.fullName || ''}","${p.method}","${p.status}",${p.amount},"${new Date(p.createdAt).toLocaleString('en-IN')}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'payments-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (loading && payments.length === 0) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={`w-8 h-8 border-2 rounded-full ${dm ? 'border-indigo-500 border-t-transparent' : 'border-black border-t-transparent'}`} /></div>;

  return (
    <div className="space-y-4">
      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Collected', value: `₹${summary.successAmt.toLocaleString('en-IN')}`, count: `${summary.success} transactions`, accent: 'text-emerald-500', accentBg: dm ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          { label: 'Failed', value: `₹${summary.failedAmt.toLocaleString('en-IN')}`, count: `${summary.failed} transactions`, accent: 'text-red-500', accentBg: dm ? 'bg-red-500/10' : 'bg-red-50' },
          { label: 'Refunded', value: `₹${summary.refundedAmt.toLocaleString('en-IN')}`, count: `${summary.refunded} transactions`, accent: 'text-amber-500', accentBg: dm ? 'bg-amber-500/10' : 'bg-amber-50' },
          { label: 'Net Revenue', value: `₹${(summary.successAmt - summary.refundedAmt).toLocaleString('en-IN')}`, count: `${payments.length} total`, accent: 'text-indigo-500', accentBg: dm ? 'bg-indigo-500/10' : 'bg-indigo-50' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`${cardCls} p-4`}>
            <div className={`inline-flex p-2 rounded-xl mb-3 ${s.accentBg} ${s.accent}`}><IndianRupee size={14} /></div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
            <p className={`text-[10px] mt-1 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{s.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {['all', 'SUCCESS', 'FAILED', 'REFUNDED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? (dm ? 'bg-white text-black' : 'bg-black text-white') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100')}`}>
              {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button onClick={exportPayments} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${dm ? 'border-white/5 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}><Download size={14} />Export</button>
      </div>

      {/* Transaction Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${dm ? 'border-white/5 bg-white/[0.02]' : 'border-gray-50 bg-gray-50/50'}`}>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Transaction</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] hidden sm:table-cell ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Customer</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Method</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Status</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-right ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Amount</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-white/5' : 'divide-gray-50'}`}>
              {filteredPayments.map((p) => (
                <tr key={p.id} className={`transition-colors ${dm ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold font-mono">#{p.id.slice(0, 8)}</p>
                    <p className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <p className="text-sm font-medium">{p.user?.fullName || 'N/A'}</p>
                    <p className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{p.user?.email || ''}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${dm ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>{p.method}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg ${statusBadge(p.status)}`}>
                      {statusIcon(p.status)} {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-bold">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="py-16 text-center">
              <AlertTriangle size={36} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No transactions found</p>
            </div>
          )}
        </div>
        <div className={`px-5 py-3 border-t text-xs font-medium ${dm ? 'border-white/5 text-gray-600' : 'border-gray-50 text-gray-400'}`}>
          {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
