import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, AlertTriangle, RefreshCcw, ExternalLink, MessageSquare, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewsTab = ({ API_BASE, searchTerm, darkMode, refreshKey }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [filterRating, setFilterRating] = useState('all');

  const dm = darkMode;
  const card = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews`);
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [API_BASE, refreshKey]);

  const handleDelete = async (id) => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
    setDeletingId(id);
    setConfirmId(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReviews();
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (r.user?.fullName || '').toLowerCase().includes(q) ||
        (r.product?.name || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q);
      const matchRating = filterRating === 'all' || r.rating === parseInt(filterRating);
      return matchSearch && matchRating;
    });
  }, [reviews, searchTerm, filterRating]);

  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { avg: 0, total: 0, dist: {} };
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    return { avg: Math.round(avg * 10) / 10, total, dist };
  }, [reviews]);

  const Stars = ({ rating, size = 12 }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size}
          className={s <= rating ? 'text-amber-400 fill-amber-400' : (dm ? 'text-gray-700' : 'text-gray-200')} />
      ))}
    </div>
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className={`w-8 h-8 border-2 rounded-full ${dm ? 'border-indigo-500 border-t-transparent' : 'border-black border-t-transparent'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Avg rating */}
        <div className={`${card} p-5`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-3 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Average Rating</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">{stats.avg || '—'}</span>
            <div>
              <Stars rating={Math.round(stats.avg)} size={16} />
              <p className={`text-xs mt-1 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{stats.total} review{stats.total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className={`lg:col-span-2 ${card} p-5`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-3 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Distribution</p>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r} className="flex items-center gap-2.5">
                <span className={`text-xs font-bold w-3 text-right ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{r}</span>
                <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? ((stats.dist[r] || 0) / stats.total) * 100 : 0}%` }}
                    transition={{ duration: 0.7, delay: (5 - r) * 0.08 }}
                    className="h-full rounded-full bg-amber-400"
                  />
                </div>
                <span className={`text-xs font-bold w-5 text-right ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{stats.dist[r] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All', val: 'all' },
          ...([5, 4, 3, 2, 1].map((r) => ({ label: `${r} ★`, val: String(r) }))),
        ].map(({ label, val }) => (
          <button key={val} onClick={() => setFilterRating(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterRating === val ? (dm ? 'bg-white text-black' : 'bg-black text-white') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100')}`}>
            {label}
          </button>
        ))}
        <span className={`ml-auto text-[11px] font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {filteredReviews.map((review) => (
          <motion.div key={review.id} layout
            className={`${card} p-4 group`}>
            <div className="flex items-start gap-4">

              {/* ── Product Image Panel (left) ── */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <button
                  onClick={() => navigate(`/product/${review.product?.id}`)}
                  className="relative block"
                  title={`View ${review.product?.name || 'product'}`}
                >
                  {review.product?.imageUrl ? (
                    <img
                      src={review.product.imageUrl}
                      alt={review.product.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-indigo-500/40 transition-all"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ring-2 ring-transparent group-hover:ring-indigo-500/40 transition-all ${dm ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Package size={22} />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-xl bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-all flex items-center justify-center">
                    <ExternalLink size={14} className="text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                  </div>
                </button>

                {/* Product name under image */}
                <button
                  onClick={() => navigate(`/product/${review.product?.id}`)}
                  className={`text-[9px] font-bold text-center leading-tight max-w-[56px] line-clamp-2 transition-colors ${dm ? 'text-gray-600 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-500'}`}
                >
                  {review.product?.name || 'Product'}
                </button>
              </div>

              {/* ── Main Content ── */}
              <div className="flex-1 min-w-0">
                {/* Top row: user + stars + delete */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* User avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${dm ? 'bg-indigo-500/10 text-indigo-400' : 'bg-black text-white'}`}>
                      {(review.user?.fullName || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight truncate">{review.user?.fullName || 'Unknown'}</p>
                      <p className={`text-[10px] truncate ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{review.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Stars rating={review.rating} size={12} />
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className={`p-1.5 rounded-lg text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 ${
                        confirmId === review.id
                          ? (dm ? 'bg-red-500/20 text-red-400 opacity-100' : 'bg-red-50 text-red-500 opacity-100')
                          : (dm ? 'hover:bg-red-500/10 text-gray-600 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500')
                      }`}
                    >
                      {deletingId === review.id
                        ? <RefreshCcw size={13} className="animate-spin" />
                        : confirmId === review.id
                          ? <>Confirm?</>
                          : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>

                {/* Product name as clickable link */}
                <button
                  onClick={() => navigate(`/product/${review.product?.id}`)}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] mb-2 transition-colors ${dm ? 'text-gray-600 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-500'}`}
                >
                  <ExternalLink size={9} />
                  {review.product?.name || 'View Product'}
                </button>

                {/* Review content */}
                {review.title && <p className="text-sm font-bold mb-0.5">{review.title}</p>}
                {review.comment && (
                  <p className={`text-sm leading-relaxed ${dm ? 'text-gray-400' : 'text-gray-600'}`}>{review.comment}</p>
                )}

                <p className={`text-[10px] mt-2 ${dm ? 'text-gray-700' : 'text-gray-300'}`}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReviews.length === 0 && (
          <div className={`${card} py-16 text-center`}>
            <MessageSquare size={36} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`text-sm font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
              {searchTerm ? 'No reviews match your search' : 'No reviews yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
