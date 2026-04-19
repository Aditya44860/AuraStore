import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Trash2, Download, Edit3, ExternalLink, Package, ChevronDown, Check, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductsTab = ({ API_BASE, searchTerm, darkMode, refreshKey }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStockValue, setBulkStockValue] = useState('');

  const dm = darkMode;
  const cardCls = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;
  const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${dm ? 'bg-white/5 border-white/5 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`;
  const labelCls = `block text-[10px] font-bold uppercase tracking-[0.15em] mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`;

  const [form, setForm] = useState({ name: '', description: '', price: '', originalPrice: '', stock: '', imageUrl: '', subcategory: '', categoryId: '', isOnSale: false });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([fetch(`${API_BASE}/api/admin/products`), fetch(`${API_BASE}/api/categories`)]);
      const [p, c] = await Promise.all([pRes.json(), cRes.json()]);
      if (p.success) setProducts(p.products);
      if (c.success) setCategories(c.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [API_BASE, refreshKey]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === 'all' || p.category?.name === filterCategory;
      const matchStock = filterStock === 'all' || (filterStock === 'in-stock' && p.stock > 0) || (filterStock === 'low-stock' && p.stock > 0 && p.stock <= 10) || (filterStock === 'out' && p.stock === 0);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchTerm, filterCategory, filterStock]);

  const openCreate = () => { setEditingProduct(null); setForm({ name: '', description: '', price: '', originalPrice: '', stock: '', imageUrl: '', subcategory: '', categoryId: '', isOnSale: false }); setShowModal(true); };
  const openEdit = (p) => { setEditingProduct(p); setForm({ name: p.name, description: p.description || '', price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', stock: String(p.stock), imageUrl: p.imageUrl || '', subcategory: p.subcategory || '', categoryId: p.categoryId || '', isOnSale: p.isOnSale }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.alert("Database modifications are disabled in the public demo.");
    return;
    const url = editingProduct ? `${API_BASE}/api/admin/products/${editingProduct.id}` : `${API_BASE}/api/admin/products`;
    const method = editingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setShowModal(false); fetchProducts(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    window.alert("Database modifications are disabled in the public demo.");
    return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const handleBulk = async () => {
    if (selectedIds.size === 0 || !bulkAction) return;
    window.alert("Database modifications are disabled in the public demo.");
    return;
    const ids = Array.from(selectedIds);
    let body = { action: bulkAction, productIds: ids, data: {} };
    if (bulkAction === 'update-stock') body.data.stock = bulkStockValue;
    if (bulkAction === 'toggle-sale') body.data.isOnSale = true;
    try {
      await fetch(`${API_BASE}/api/admin/products/bulk`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setSelectedIds(new Set()); setBulkAction(''); setBulkStockValue(''); fetchProducts();
    } catch (err) { console.error(err); }
  };

  const toggleSelect = (id) => { const next = new Set(selectedIds); next.has(id) ? next.delete(id) : next.add(id); setSelectedIds(next); };
  const toggleAll = () => { if (selectedIds.size === filteredProducts.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredProducts.map(p => p.id))); };

  const exportCSV = () => {
    const headers = 'Name,Category,Subcategory,Price,Stock,Sale,Active\n';
    const rows = products.map(p => `"${p.name}","${p.category?.name || ''}","${p.subcategory || ''}",${p.price},${p.stock},${p.isOnSale},${p.isActive}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'products-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (loading && products.length === 0) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={`w-8 h-8 border-2 rounded-full ${dm ? 'border-indigo-500 border-t-transparent' : 'border-black border-t-transparent'}`} /></div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border ${dm ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border ${dm ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock (≤10)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${dm ? 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}><Download size={14} />Export</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} />Add Product</button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={`${cardCls} p-4 flex flex-wrap items-center gap-3`}>
            <span className="text-xs font-bold">{selectedIds.size} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className={`${inputCls} w-auto !py-1.5`}>
              <option value="">Choose action...</option>
              <option value="delete">Delete Selected</option>
              <option value="update-stock">Set Stock</option>
              <option value="toggle-sale">Mark as Sale</option>
            </select>
            {bulkAction === 'update-stock' && <input type="number" placeholder="Stock qty" value={bulkStockValue} onChange={(e) => setBulkStockValue(e.target.value)} className={`${inputCls} w-24 !py-1.5`} />}
            <button onClick={handleBulk} disabled={!bulkAction} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold disabled:opacity-40">Apply</button>
            <button onClick={() => setSelectedIds(new Set())} className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${dm ? 'border-white/5 bg-white/[0.02]' : 'border-gray-50 bg-gray-50/50'}`}>
                <th className="px-5 py-4 w-10"><input type="checkbox" checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0} onChange={toggleAll} className="rounded" /></th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Product</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] hidden md:table-cell ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Category</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Stock</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Price</th>
                <th className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-right ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-white/5' : 'divide-gray-50'}`}>
              {filteredProducts.map((p) => (
                <tr key={p.id} className={`group transition-colors ${dm ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'} ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3"><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100" /> : <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dm ? 'bg-white/5' : 'bg-gray-100'}`}><Package size={16} className={dm ? 'text-gray-600' : 'text-gray-400'} /></div>}
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className={`text-[10px] font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{p.subcategory || 'General'} {p.isOnSale && <span className="text-amber-500 ml-1">• SALE</span>}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-5 py-3 hidden md:table-cell`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${dm ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>{p.category?.name || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold">{p.stock}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold">₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                    {p.originalPrice && <span className={`text-[10px] line-through ml-1.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>₹{parseFloat(p.originalPrice).toLocaleString('en-IN')}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-black'}`}><Edit3 size={14} /></button>
                      <button onClick={() => navigate(`/product/${p.id}`)} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-black'}`}><ExternalLink size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>{deletingId === p.id ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <AlertTriangle size={36} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No products match your filters</p>
            </div>
          )}
        </div>
        {/* Product count */}
        <div className={`px-5 py-3 border-t text-xs font-medium ${dm ? 'border-white/5 text-gray-600' : 'border-gray-50 text-gray-400'}`}>
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6 ${dm ? 'bg-[#141416] border border-white/5' : 'bg-white shadow-2xl'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className={labelCls}>Product Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Classic Cotton Tee" /></div>
                <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} min-h-[80px]`} placeholder="Brief description..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Price (₹) *</label><input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="1499" /></div>
                  <div><label className={labelCls}>Original Price (₹)</label><input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className={inputCls} placeholder="2499" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Stock *</label><input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} placeholder="50" /></div>
                  <div><label className={labelCls}>Subcategory</label><input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className={inputCls} placeholder="tshirts, jeans..." /></div>
                </div>
                <div><label className={labelCls}>Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Image URL</label><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputCls} placeholder="https://..." /></div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${form.isOnSale ? 'bg-indigo-500 border-indigo-500' : (dm ? 'border-white/10' : 'border-gray-300')}`}>
                    {form.isOnSale && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm({ ...form, isOnSale: e.target.checked })} className="hidden" />
                  <span className="text-sm font-medium">Mark as On Sale</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-white/5 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">{editingProduct ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsTab;
