import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Store, Truck, Bell, Check, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

const SettingsTab = ({ darkMode, adminPassword, setAdminPassword }) => {
  const dm = darkMode;
  const card = `rounded-2xl border transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;
  const input = `w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${dm ? 'bg-white/5 border-white/5 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`;
  const label = `block text-[10px] font-bold uppercase tracking-[0.15em] mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`;

  const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-2.5 mb-5">
      {icon}
      <h3 className="text-base font-bold">{title}</h3>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-indigo-500' : (dm ? 'bg-white/10' : 'bg-gray-200')}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  // ── Store settings ──
  const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem('aura_admin_settings') || 'null'); } catch { return null; }
  };
  const defaults = {
    storeName: 'AuraStore',
    storeTagline: 'Premium streetwear & fashion for the modern generation',
    storeCurrency: 'INR',
    storeLocale: 'en-IN',
    taxEnabled: true,
    taxRate: '18',
    shippingFlatRate: '99',
    freeShippingThreshold: '1499',
    shippingEstimate: '3-5 business days',
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    lowStockThreshold: '5',
    weeklyReport: true,
  };

  const [settings, setSettings] = useState(() => loadSettings() || defaults);
  const [saved, setSaved] = useState(false);
  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('aura_admin_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Password change ──
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passStatus, setPassStatus] = useState(null); // 'success' | 'error' | null
  const [passMessage, setPassMessage] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    window.alert("Database modifications are disabled in the public demo.");
    return;
    if (currentPass !== adminPassword) {
      setPassStatus('error');
      setPassMessage('Current password is incorrect');
      setTimeout(() => setPassStatus(null), 3000);
      return;
    }
    if (newPass.length < 6) {
      setPassStatus('error');
      setPassMessage('New password must be at least 6 characters');
      setTimeout(() => setPassStatus(null), 3000);
      return;
    }
    if (newPass !== confirmPass) {
      setPassStatus('error');
      setPassMessage("Passwords don't match");
      setTimeout(() => setPassStatus(null), 3000);
      return;
    }
    // Save new password
    setAdminPassword(newPass);
    localStorage.setItem('aura_admin_pass', newPass);
    setPassStatus('success');
    setPassMessage('Password updated successfully');
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setTimeout(() => setPassStatus(null), 3000);
  };

  const passStrength = (p) => {
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-500', w: '25%' };
    if (p.length < 8) return { label: 'Weak', color: 'bg-amber-500', w: '50%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: 'bg-yellow-400', w: '65%' };
    return { label: 'Strong', color: 'bg-emerald-500', w: '100%' };
  };

  const strength = passStrength(newPass);

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── Store Information ── */}
      <div className={`${card} p-6`}>
        <SectionHeader icon={<Store size={16} className="text-indigo-500" />} title="Store Information" />
        <div className="space-y-4">
          <div>
            <label className={label}>Store Name</label>
            <input value={settings.storeName} onChange={e => set('storeName', e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Tagline</label>
            <input value={settings.storeTagline} onChange={e => set('storeTagline', e.target.value)} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Currency</label>
              <select value={settings.storeCurrency} onChange={e => set('storeCurrency', e.target.value)} className={input}>
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
            <div>
              <label className={label}>Locale</label>
              <select value={settings.storeLocale} onChange={e => set('storeLocale', e.target.value)} className={input}>
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (India)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tax & Shipping ── */}
      <div className={`${card} p-6`}>
        <SectionHeader icon={<Truck size={16} className="text-blue-500" />} title="Tax & Shipping" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Enable GST</p>
              <p className={`text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Apply tax to all orders</p>
            </div>
            <ToggleSwitch checked={settings.taxEnabled} onChange={v => set('taxEnabled', v)} />
          </div>
          <AnimatePresence>
            {settings.taxEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className={label}>Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={e => set('taxRate', e.target.value)} className={`${input} w-32`} placeholder="18" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Flat Shipping (₹)</label>
              <input type="number" value={settings.shippingFlatRate} onChange={e => set('shippingFlatRate', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Free Shipping Above (₹)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={e => set('freeShippingThreshold', e.target.value)} className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Estimated Delivery</label>
            <input value={settings.shippingEstimate} onChange={e => set('shippingEstimate', e.target.value)} className={input} />
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className={`${card} p-6`}>
        <SectionHeader icon={<Bell size={16} className="text-amber-500" />} title="Notifications" />
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Updates for important events' },
            { key: 'orderAlerts', label: 'New Order Alerts', desc: 'Notified for each new order' },
            { key: 'lowStockAlerts', label: 'Low Stock Warnings', desc: 'Alert when stock falls below threshold' },
            { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Weekly business performance digest' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold">{item.label}</p>
                <p className={`text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{item.desc}</p>
              </div>
              <ToggleSwitch checked={settings[item.key]} onChange={v => set(item.key, v)} />
            </div>
          ))}
          <AnimatePresence>
            {settings.lowStockAlerts && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className={label}>Low Stock Threshold (units)</label>
                <input type="number" value={settings.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} className={`${input} w-32`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Save Store Settings ── */}
      <motion.button onClick={handleSave} whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg ${saved ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'} text-white`}>
        {saved ? <><Check size={15} />Saved!</> : <><Save size={15} />Save Settings</>}
      </motion.button>

      {/* ── Change Password ── */}
      <div className={`${card} p-6`}>
        <SectionHeader icon={<ShieldCheck size={16} className="text-rose-500" />} title="Change Admin Password" />

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className={label}>Current Password</label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${dm ? 'text-gray-600' : 'text-gray-400'}`} size={14} />
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                className={`${input} pl-10 pr-10`}
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrentPass(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${dm ? 'text-gray-600 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className={label}>New Password</label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${dm ? 'text-gray-600' : 'text-gray-400'}`} size={14} />
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className={`${input} pl-10 pr-10`}
                placeholder="Minimum 6 characters"
              />
              <button type="button" onClick={() => setShowNewPass(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${dm ? 'text-gray-600 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* Strength meter */}
            {newPass && strength && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1">
                <div className={`h-1 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: strength.w }} transition={{ duration: 0.4 }}
                    className={`h-full rounded-full ${strength.color}`} />
                </div>
                <p className={`text-[10px] font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={label}>Confirm New Password</label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${dm ? 'text-gray-600' : 'text-gray-400'}`} size={14} />
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className={`${input} pl-10 pr-10 ${confirmPass && confirmPass !== newPass ? (dm ? 'border-red-500/40 ring-1 ring-red-500/30' : 'border-red-300') : ''}`}
                placeholder="Re-enter new password"
              />
              <button type="button" onClick={() => setShowConfirmPass(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${dm ? 'text-gray-600 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {confirmPass && confirmPass !== newPass && (
              <p className="text-red-400 text-[10px] font-medium mt-1">Passwords don't match</p>
            )}
          </div>

          {/* Status message */}
          <AnimatePresence>
            {passStatus && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${passStatus === 'success' ? (dm ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : (dm ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200')}`}>
                {passStatus === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
                {passMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit"
            disabled={true}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-xl text-sm font-bold opacity-40 cursor-not-allowed transition-all">
            <Lock size={14} />Update Password (Disabled in Demo)
          </button>
        </form>
      </div>

    </div>
  );
};

export default SettingsTab;
