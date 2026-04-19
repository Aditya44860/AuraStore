import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Users, ChevronRight, IndianRupee, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

/* ─── India GeoJSON (states) ─── */
const INDIA_GEO_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

/* ─── State name normalizer → consistent key ─── */
const normalizeKey = (name) => (name || '').toLowerCase().trim()
  .replace(/\s+/g, ' ')
  .replace(/[&]/g, 'and');

const STATE_ALIASES = {
  'jammu & kashmir': 'jammu and kashmir',
  'j&k': 'jammu and kashmir',
  'jk': 'jammu and kashmir',
  'uttarakhand': 'uttarakhand', 'uttaranchal': 'uttarakhand', 'uk': 'uttarakhand',
  'odisha': 'odisha', 'orissa': 'odisha',
  'chhattisgarh': 'chhattisgarh', 'chattisgarh': 'chhattisgarh',
  'new delhi': 'delhi', 'dl': 'delhi',
  'wb': 'west bengal',
  'up': 'uttar pradesh',
  'mp': 'madhya pradesh',
  'ap': 'andhra pradesh',
  'tn': 'tamil nadu',
  'ka': 'karnataka', 'kl': 'kerala',
};

const resolveStateName = (name) => {
  const k = normalizeKey(name);
  return STATE_ALIASES[k] || k;
};

/* ─── Indigo color scale ─── */
const SCALE_COLORS = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];
const getColor = (intensity) => {
  if (intensity <= 0) return null; // will use default
  const idx = Math.min(Math.floor(intensity * (SCALE_COLORS.length - 2)) + 1, SCALE_COLORS.length - 1);
  return SCALE_COLORS[idx];
};

/* ══════════════════════════════════════════
   INDIA CHOROPLETH MAP
══════════════════════════════════════════ */
const IndiaChoroplethMap = ({ data, darkMode }) => {
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState({ coordinates: [80.5, 23.5], zoom: 1 });
  const dm = darkMode;

  const geoLookup = {};
  (data || []).forEach((d) => {
    const key = resolveStateName(d.state);
    if (!geoLookup[key]) geoLookup[key] = { orders: 0, revenue: 0, rawName: d.state };
    geoLookup[key].orders += d.orders;
    geoLookup[key].revenue += d.revenue;
  });
  const maxOrders = Math.max(...Object.values(geoLookup).map((g) => g.orders), 1);

  const getStateData = (geoName) => {
    const key = resolveStateName(geoName);
    return geoLookup[key] || null;
  };

  const topStates = Object.entries(geoLookup)
    .sort((a, b) => b[1].orders - a[1].orders)
    .slice(0, 5);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Map */}
        <div
          className={`relative flex-shrink-0 rounded-2xl overflow-hidden border ${dm ? 'border-white/5 bg-[#0e0e11]/50' : 'border-gray-100 bg-[#f8f9fa]'}`}
          style={{ width: '100%', maxWidth: 340, height: 380 }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
          {/* Custom fixed zoom controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <button onClick={() => setPos(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 4) }))} className={`p-1.5 rounded-lg border shadow-sm transition-colors ${dm ? 'bg-[#1a1a24] border-white/10 hover:bg-white/10 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-black'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button onClick={() => setPos(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))} className={`p-1.5 rounded-lg border shadow-sm transition-colors ${dm ? 'bg-[#1a1a24] border-white/10 hover:bg-white/10 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-black'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
            </button>
          </div>

          <div style={{ width: '100%', height: '100%' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [80.5, 23.5], scale: 650 }}
              style={{ width: '100%', height: '100%' }}
              width={340}
              height={380}
            >
              <ZoomableGroup zoom={pos.zoom} center={pos.coordinates} onMoveEnd={setPos}>
                <Geographies geography={INDIA_GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const geoName = geo.properties.NAME_1 || geo.properties.name || geo.properties.ST_NM || '';
                    const sd = getStateData(geoName);
                    const intensity = sd ? sd.orders / maxOrders : 0;
                    const fillColor = sd ? (getColor(intensity) || SCALE_COLORS[1]) : (dm ? '#1e1e28' : '#e8ecf4');
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={dm ? '#2a2a3a' : '#c8d0e0'}
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none', transition: 'fill 0.2s' },
                          hover: {
                            fill: sd ? '#4338ca' : (dm ? '#2a2a3a' : '#dde3f0'),
                            outline: 'none',
                            cursor: 'pointer',
                          },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={() => setTooltip({ name: geoName, ...sd })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className={`absolute pointer-events-none z-50 px-3 py-2 rounded-xl text-[11px] font-medium shadow-2xl border ${dm ? 'bg-[#0e0e10] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
                style={{
                  left: Math.min(mousePos.x + 12, 280),
                  top: Math.max(mousePos.y - 52, 4),
                }}
              >
                <p className="font-bold text-xs">{tooltip.name}</p>
                {tooltip.orders > 0 ? (
                  <>
                    <p className={`mt-0.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tooltip.orders} order{tooltip.orders !== 1 ? 's' : ''}
                    </p>
                    <p className="text-indigo-500 font-bold">₹{tooltip.revenue.toLocaleString('en-IN')}</p>
                  </>
                ) : (
                  <p className={dm ? 'text-gray-600' : 'text-gray-400'}>No orders yet</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Legend */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-2 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Order Volume</p>
            <div className="flex items-center gap-0.5">
              {SCALE_COLORS.map((c, i) => (
                <div key={i} className="flex-1 h-2.5 first:rounded-l-full last:rounded-r-full" style={{ background: c }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-[9px] font-medium ${dm ? 'text-gray-700' : 'text-gray-400'}`}>None</span>
              <span className={`text-[9px] font-medium ${dm ? 'text-gray-700' : 'text-gray-400'}`}>Highest</span>
            </div>
          </div>

          {/* Top States */}
          {topStates.length > 0 ? (
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-3 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Top States</p>
              <div className="space-y-3">
                {topStates.map(([key, g], i) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold w-4 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{i + 1}</span>
                        <span className="text-xs font-bold capitalize">{g.rawName || key}</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-500">{g.orders}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(g.orders / maxOrders) * 100}%` }}
                        transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(to right, #818cf8, #4f46e5)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`text-center py-6 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
              <p className="text-3xl mb-2">🗺️</p>
              <p className="text-xs font-medium">No geographic data yet</p>
              <p className={`text-[11px] mt-1 ${dm ? 'text-gray-700' : 'text-gray-300'}`}>Orders with shipping addresses appear here</p>
            </div>
          )}

          {/* Geo total */}
          {topStates.length > 0 && (
            <div className={`p-3 rounded-xl ${dm ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-indigo-50 border border-indigo-100'}`}>
              <p className={`text-[10px] font-bold mb-1 ${dm ? 'text-indigo-400' : 'text-indigo-600'}`}>Total Revenue</p>
              <p className="text-sm font-bold text-indigo-500">₹{Object.values(geoLookup).reduce((s, g) => s + g.revenue, 0).toLocaleString('en-IN')}</p>
              <p className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>across {Object.keys(geoLookup).length} state{Object.keys(geoLookup).length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   AREA CHART — Smooth Bezier Revenue Trends
══════════════════════════════════════════ */
const AreaChart = ({ data, darkMode }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const dm = darkMode;
  if (!data || data.length === 0) {
    return <div className="h-44 flex items-center justify-center text-sm text-gray-500">No revenue data yet</div>;
  }
  const W = 800, H = 200, PX = 40, PY = 35;
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1) * 1.25;

  const pts = data.map((d, i) => ({
    x: PX + (data.length > 1 ? (i / (data.length - 1)) * (W - PX * 2) : (W / 2)),
    y: data.length > 1 ? (PY + (1 - d.revenue / maxRevenue) * (H - PY * 2)) : H - PY,
    ...d
  }));

  const getD = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i-1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
  };

  const linePath = getD(pts);
  const areaPath = pts.length > 1 ? `${linePath} L ${pts[pts.length-1].x},${H} L ${pts[0].x},${H} Z` : '';

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full relative z-10" style={{ height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={dm ? 0.3 : 0.15} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.33, 0.66, 1].map((p, i) => {
          const y = PY + p * (H - PY * 2);
          return <line key={i} x1={PX} y1={y} x2={W - PX} y2={y} stroke={dm ? '#ffffff' : '#000000'} strokeOpacity={dm ? 0.05 : 0.05} strokeDasharray="3 3"/>;
        })}

        {/* Line & Area */}
        <motion.path d={areaPath} fill="url(#areaGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <motion.path d={linePath} fill="none" stroke="#6366f1" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />

        {/* Interactions & Points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 6 : 4} fill={hoverIdx === i ? '#4f46e5' : '#ffffff'} stroke="#4f46e5" strokeWidth={2}
               className="transition-all duration-200" style={{ transformOrigin: `${p.x}px ${p.y}px`, transform: hoverIdx === i ? 'scale(1.2)' : 'scale(1)' }}/>
            {/* Invis box for hovering easily */}
            <rect x={p.x - Math.max(((W - 2*PX) / data.length)/2, 10)} y={0} width={Math.max((W - 2*PX) / data.length, 20)} height={H + 24} 
                  fill="transparent" cursor="pointer" onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
          </g>
        ))}

        {/* Tooltip Hover line */}
        {hoverIdx !== null && pts[hoverIdx] && (
          <line x1={pts[hoverIdx].x} y1={pts[hoverIdx].y + 6} x2={pts[hoverIdx].x} y2={H} stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} />
        )}

        {/* Month SVG Labels */}
        {pts.map((p, i) => (
          <text key={`lbl-${i}`} x={p.x} y={H + 20} textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoverIdx === i ? (dm?'#818cf8':'#4f46e5') : (dm ? '#6b7280' : '#9ca3af')} className="uppercase transition-colors">
            {p.month}
          </text>
        ))}
      </svg>

      {/* HTML Tooltip Overlay (Fixed Top Center) */}
      <AnimatePresence>
        {hoverIdx !== null && pts[hoverIdx] && (
          <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
             className={`absolute pointer-events-none z-50 p-2.5 rounded-xl shadow-sm border min-w-[280px] ${dm ? 'bg-[#141416]/90 text-white border-white/5' : 'bg-white/90 text-black border-gray-100'}`}
             style={{ 
               left: '50%', 
               top: -58, 
               transform: 'translateX(-50%)'
             }}>
             <div className="flex justify-between items-center w-full px-2 gap-6">
               <div className={`text-[11px] font-bold uppercase tracking-wider ${dm ? 'text-gray-300' : 'text-gray-600'}`}>
                 {pts[hoverIdx].month}
               </div>

               <div className="flex text-[11px] items-center">
                 {/* Revenue */}
                 <div className="flex flex-col text-right">
                   <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${dm?'text-gray-500':'text-gray-400'}`}>Revenue</span>
                   <span className={`font-bold tracking-tight ${dm?'text-white':'text-black'}`}>₹{pts[hoverIdx].revenue.toLocaleString('en-IN')}</span>
                 </div>
                 
                 {/* Divider */}
                 <div className="h-6 border-l border-dashed mx-4" style={{ borderColor: dm ? '#ffffff20' : '#00000020' }}></div>

                 {/* Orders */}
                 <div className="flex flex-col text-right">
                   <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${dm?'text-gray-500':'text-gray-400'}`}>Orders</span>
                   <span className={`font-bold ${dm?'text-indigo-400':'text-indigo-600'}`}>{pts[hoverIdx].orders}</span>
                 </div>

                 {/* Divider */}
                 <div className="h-6 border-l border-dashed mx-4" style={{ borderColor: dm ? '#ffffff20' : '#00000020' }}></div>

                 {/* AOV */}
                 <div className="flex flex-col text-right">
                   <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${dm?'text-gray-500':'text-gray-400'}`}>Avg Order</span>
                   <span className={`font-bold ${dm?'text-emerald-400':'text-emerald-600'}`}>₹{pts[hoverIdx].orders > 0 ? Math.round(pts[hoverIdx].revenue / pts[hoverIdx].orders).toLocaleString('en-IN') : 0}</span>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════
   CATEGORY SALES — Donut + Subcategory Breakdown
══════════════════════════════════════════ */
const CategorySalesView = ({ data, darkMode }) => {
  const [hovered, setHovered] = useState(null);
  const [metric, setMetric] = useState('revenue');
  const dm = darkMode;
  if (!data || data.length === 0) return <div className="h-[380px] flex items-center justify-center text-sm text-gray-500">No category data yet</div>;
  const total = data.reduce((s, d) => s + d[metric], 0) || 1;
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
  const R = 88, r = 56, cx = 120, cy = 120;
  const toRad = (d) => (d * Math.PI) / 180;
  let cum = -90;

  const arc = (start, sweep) => {
    if (sweep >= 360) sweep = 359.99;
    const s = toRad(start), e = toRad(start + sweep);
    const la = sweep > 180 ? 1 : 0;
    return `M ${cx + R * Math.cos(s)} ${cy + R * Math.sin(s)} A ${R} ${R} 0 ${la} 1 ${cx + R * Math.cos(e)} ${cy + R * Math.sin(e)} L ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)} A ${r} ${r} 0 ${la} 0 ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} Z`;
  };

  return (
    <div className="flex flex-col h-full min-h-[380px] max-h-[440px]">
      
      {/* Slicer Toggle */}
      <div className="flex justify-center mb-2">
        <div className={`p-1 rounded-lg inline-flex ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
          <button onClick={() => setMetric('revenue')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${metric === 'revenue' ? (dm ? 'bg-[#2a2a35] text-white shadow-sm' : 'bg-white text-black shadow-sm') : (dm ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-black')}`}>Revenue</button>
          <button onClick={() => setMetric('orders')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${metric === 'orders' ? (dm ? 'bg-[#2a2a35] text-white shadow-sm' : 'bg-white text-black shadow-sm') : (dm ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-black')}`}>Orders</button>
        </div>
      </div>

      {/* Top: Donut Chart */}
      <div className="flex justify-center mb-6 shrink-0">
        <svg viewBox="0 0 240 240" className="w-48 h-48 sm:w-56 sm:h-56">
          {data.map((d, i) => {
            const sweep = (d[metric] / total) * 360;
            const path = arc(cum, sweep);
            cum += sweep;
            return (
              <motion.path key={i} d={path} fill={COLORS[i % COLORS.length]}
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: hovered === i ? 1.05 : 1, opacity: 1 }}
                transition={{ delay: i * 0.06, duration: 0.35, type: 'spring' }}
                style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            );
          })}
          <circle cx={cx} cy={cy} r={r - 4} fill={dm ? '#141416' : 'white'} />
          <text x={cx} y={cy - 6} textAnchor="middle" fill={dm ? '#fff' : '#111'} fontSize="16" fontWeight="bold">
            {metric === 'revenue' ? (total >= 1000 ? `₹${(total / 1000).toFixed(0)}K` : `₹${total}`) : total.toLocaleString('en-IN')}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill={dm ? '#6b7280' : '#9ca3af'} fontSize="8" letterSpacing="0.05em" textTransform="uppercase">
            {metric === 'revenue' ? 'Total Rev' : 'Total Orders'}
          </text>
        </svg>
      </div>

      {/* Bottom: Scrollable Category Breakdown */}
      <div className={`flex-1 overflow-y-auto pr-2 space-y-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full ${dm ? '[&::-webkit-scrollbar-thumb]:bg-white/10' : '[&::-webkit-scrollbar-thumb]:bg-gray-200'}`}>
        {data.map((d, i) => {
          const color = COLORS[i % COLORS.length];
          const pct = ((d[metric] / total) * 100).toFixed(1);
          return (
            <div key={i} className="group" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3 cursor-default">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                  <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-gray-900'} capitalize`}>{d.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">
                    {metric === 'revenue' ? `₹${d.revenue.toLocaleString('en-IN')}` : d.orders.toLocaleString('en-IN')}
                  </span>
                  <span className={`inline-block w-9 text-right text-[10px] font-bold ml-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{pct}%</span>
                </div>
              </div>
              
              {/* Subcategories Breakdown */}
              {d.subcategories && d.subcategories.length > 0 && (
                <div className="pl-[18px] border-l-2 space-y-2.5 ml-[5px]" style={{ borderColor: dm ? '#ffffff0a' : '#f3f4f6' }}>
                  {d.subcategories.map((sub, j) => {
                    const subPct = ((sub[metric] / d[metric]) * 100).toFixed(0);
                    return (
                      <div key={j} className="flex flex-col gap-1.5 cursor-default">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.05em]">
                          <span className={dm ? 'text-gray-400' : 'text-gray-500'}>{sub.name}</span>
                          <div className="flex gap-2">
                             <span className={dm ? 'text-gray-500' : 'text-gray-400'}>
                               {metric === 'revenue' ? `₹${sub.revenue.toLocaleString()}` : sub.orders.toLocaleString()}
                             </span>
                          </div>
                        </div>
                        {/* Tiny sub-bar */}
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${subPct}%` }}
                             transition={{ duration: 0.8, delay: j * 0.1 }}
                             className="h-full rounded-full" style={{ background: color, opacity: hovered === i || hovered === null ? 0.8 : 1 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   TRAFFIC LINE CHART — real-time polling
══════════════════════════════════════════ */
const POLL_INTERVAL = 30000; // 30 s

const TrafficChart = ({ API_BASE, darkMode, initialData }) => {
  const dm = darkMode;
  const [data, setData] = useState(initialData || []);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [live, setLive] = useState(true);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const timerRef = useRef(null);

  const fetchTraffic = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/analytics`);
      const json = await res.json();
      if (json.success && json.analytics?.traffic) {
        setData(json.analytics.traffic);
        setLastUpdated(new Date());
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 1500);
      }
    } catch (e) { setLive(false); }
  }, [API_BASE]);

  // Sync initial data when parent refreshes
  useEffect(() => {
    if (initialData?.length) setData(initialData);
  }, [initialData]);

  // Poll every 30s
  useEffect(() => {
    if (!live) return;
    timerRef.current = setInterval(fetchTraffic, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchTraffic, live]);

  if (!data || data.length < 2) return <div className="h-36 flex items-center justify-center text-sm text-gray-500">Collecting traffic data...</div>;

  const maxV = Math.max(...data.map((d) => d.visitors), 1);
  const W = 800, H = 150, PX = 30, PY = 15;

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (W - PX * 2) + PX,
    y: (1 - d.visitors / maxV) * (H - PY * 2) + PY,
    ...d,
  }));

  const line = `M ${pts.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const area = `${line} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`;

  // Today's point
  const todayPt = pts[pts.length - 1];

  const [hoverIdx, setHoverIdx] = useState(null);
  const segmentW = (W - PX * 2) / (Math.max(pts.length - 1, 1));

  return (
    <div className="relative p-1">
      {/* Live status bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${live ? 'bg-emerald-500' : 'bg-gray-500'}`}
            animate={live ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${live ? (dm ? 'text-emerald-400' : 'text-emerald-600') : (dm ? 'text-gray-600' : 'text-gray-400')}`}>
            {live ? 'Live' : 'Offline'}
          </span>
          <AnimatePresence>
            {justRefreshed && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className={`text-[10px] font-medium ${dm ? 'text-indigo-400' : 'text-indigo-600'}`}>updated</motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className={`text-[10px] ${dm ? 'text-gray-700' : 'text-gray-300'}`}>
          Refreshes every 30s · Last: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full relative z-10" style={{ height: 150 }}>
        <defs>
          <linearGradient id="trafGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={dm ? 0.22 : 0.1} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((p, i) => (
          <line key={i} x1={PX} y1={PY + p * (H - PY * 2)} x2={W - PX} y2={PY + p * (H - PY * 2)}
            stroke={dm ? '#1a1a24' : '#f1f5f9'} strokeWidth={1} />
        ))}
        <motion.path d={area} fill="url(#trafGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={line} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />

        {hoverIdx !== null && pts[hoverIdx] && (
          <g>
            <line x1={pts[hoverIdx].x} y1={PY} x2={pts[hoverIdx].x} y2={H - PY} stroke={dm ? '#ffffff40' : '#00000030'} strokeWidth={1} strokeDasharray="4 4" />
            <circle cx={pts[hoverIdx].x} cy={pts[hoverIdx].y} r={4} fill={dm ? '#141416' : 'white'} stroke="#6366f1" strokeWidth={2} />
          </g>
        )}

        {/* Today pulsing dot (only if not hovering over it) */}
        {hoverIdx !== pts.length - 1 && (
          <motion.circle cx={todayPt.x} cy={todayPt.y} r={4} fill="#6366f1"
            animate={{ r: [3, 6, 3], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        )}

        {/* Date labels */}
        {pts.filter((_, i) => i % 6 === 0 || i === pts.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 2} textAnchor="middle" fill={dm ? '#3a3a50' : '#c0c8d8'} fontSize={9}>{p.date?.slice(5)}</text>
        ))}

        {/* Invisible hit targets for hover events */}
        {pts.map((p, i) => (
          <rect key={`hit-${i}`} x={p.x - segmentW / 2} y={0} width={segmentW} height={H} fill="transparent"
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} className="cursor-crosshair" />
        ))}
      </svg>

      {/* HTML Tooltip Overlay */}
      <AnimatePresence>
        {hoverIdx !== null && pts[hoverIdx] && (
          <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
             className={`absolute pointer-events-none z-50 p-2.5 rounded-xl shadow-sm border min-w-[200px] ${dm ? 'bg-[#141416]/90 text-white border-white/5' : 'bg-white/90 text-black border-gray-100'}`}
             style={{ 
               right: 4, 
               top: -54
             }}>
             <div className="flex justify-between items-center w-full gap-4">
               <div className={`text-[10px] font-bold tracking-wider ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                 {new Date(pts[hoverIdx].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric'})}
               </div>
               <div className="flex gap-4 text-[11px]">
                 <div className="flex flex-col text-right">
                   <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${dm?'text-gray-500':'text-gray-400'}`}>Visitors</span>
                   <span className={`font-bold tracking-tight ${dm?'text-white':'text-black'}`}>{pts[hoverIdx].visitors.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col text-right border-l pl-3 border-dashed" style={{ borderColor: dm ? '#ffffff20' : '#00000020' }}>
                   <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${dm?'text-indigo-500/80':'text-indigo-400'}`}>Orders</span>
                   <span className={`font-bold ${dm?'text-indigo-400':'text-indigo-600'}`}>{pts[hoverIdx].orders}</span>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's stats row */}
      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${dm ? 'border-white/5' : 'border-gray-100'}`}>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Today</span>
          <p className="text-sm font-bold">{todayPt.visitors.toLocaleString()} <span className={`text-[11px] font-normal ${dm ? 'text-gray-600' : 'text-gray-400'}`}>est. visitors</span></p>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Orders</span>
          <p className="text-sm font-bold">{todayPt.orders}</p>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>30-day peak</span>
          <p className="text-sm font-bold">{maxV.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN DASHBOARD TAB
══════════════════════════════════════════ */
const DashboardTab = ({ API_BASE, darkMode, refreshKey, setActiveTab }) => {
  const [analytics, setAnalytics] = useState(null);
  const [categorySales, setCategorySales] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const dm = darkMode;
  const card = `rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${dm ? 'bg-[#141416] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [aRes, cRes, mRes, gRes, oRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/analytics`),
          fetch(`${API_BASE}/api/admin/analytics/category-sales`),
          fetch(`${API_BASE}/api/admin/analytics/monthly-revenue`),
          fetch(`${API_BASE}/api/admin/analytics/geo`),
          fetch(`${API_BASE}/api/admin/orders`),
        ]);
        const [a, c, m, g, o] = await Promise.all([aRes.json(), cRes.json(), mRes.json(), gRes.json(), oRes.json()]);
        if (a.success) setAnalytics(a.analytics);
        if (c.success) setCategorySales(c.data);
        if (m.success) setMonthlyRevenue(m.data);
        if (g.success) setGeoData(g.data);
        if (o.success) setRecentOrders(o.orders?.slice(0, 6) || []);
      } catch (err) { console.error('Dashboard fetch error:', err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [API_BASE, refreshKey]);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className={`w-8 h-8 border-2 rounded-full ${dm ? 'border-indigo-500 border-t-transparent' : 'border-black border-t-transparent'}`} />
      </div>
    );
  }

  const a = analytics || {};
  const avgOrderValue = a.totalOrders > 0 ? (a.totalRevenue / a.totalOrders) : 0;

  const kpis = [
    { label: 'Total Revenue', value: `₹${(a.totalRevenue || 0).toLocaleString('en-IN')}`, sub: `${a.monthOrders || 0} orders this month`, icon: IndianRupee, accent: 'text-emerald-500', accentBg: dm ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    { label: 'Total Orders', value: (a.totalOrders || 0).toLocaleString('en-IN'), sub: `Today: ${a.todayOrders || 0} · Week: ${a.weekOrders || 0}`, icon: ShoppingBag, accent: 'text-blue-500', accentBg: dm ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: 'Customers', value: (a.totalUsers || 0).toLocaleString('en-IN'), sub: `${a.activeUsers || 0} ordered this month`, icon: Users, accent: 'text-violet-500', accentBg: dm ? 'bg-violet-500/10' : 'bg-violet-50' },
    { label: 'Avg Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`, sub: `${a.totalProducts || 0} products in catalog`, icon: TrendingUp, accent: 'text-amber-500', accentBg: dm ? 'bg-amber-500/10' : 'bg-amber-50' },
  ];

  const statusColors = { DELIVERED: 'bg-emerald-500', SHIPPED: 'bg-blue-500', PAID: 'bg-indigo-500', PENDING: 'bg-amber-500', CANCELED: 'bg-red-500' };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`${card} hover:shadow-md hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${k.accentBg} ${k.accent}`}><k.icon size={17} /></div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${dm ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'}`}>Live</span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{k.label}</p>
            <h3 className="text-2xl font-bold tracking-tight">{k.value}</h3>
            <p className={`text-[11px] mt-1.5 font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Revenue */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold">Monthly Revenue</h3>
            <p className={`text-xs mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Last 12 months</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">₹{(a.totalRevenue || 0).toLocaleString('en-IN')}</p>
            <p className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>all time</p>
          </div>
        </div>
        <AreaChart data={monthlyRevenue} darkMode={dm} />
      </div>

      {/* Pie + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} flex flex-col`}>
          <div className="mb-5">
            <h3 className="text-base font-bold">Category & Subcategory</h3>
            <p className={`text-xs mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Volume and monetary distributions</p>
          </div>
          <div className="flex-1 min-h-[380px]">
            <CategorySalesView data={categorySales} darkMode={dm} />
          </div>
        </div>
        <div className={card}>
          <div className="mb-4">
            <h3 className="text-base font-bold">India Order Heatmap</h3>
            <p className={`text-xs mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>State-wise delivery distribution · hover to inspect</p>
          </div>
          <IndiaChoroplethMap data={geoData} darkMode={dm} />
        </div>
      </div>

      {/* Traffic — live poll */}
      <div className={card}>
        <div className="mb-4">
          <h3 className="text-base font-bold">Traffic Trends</h3>
          <p className={`text-xs mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Estimated daily visitors — 30 days</p>
        </div>
        <TrafficChart API_BASE={API_BASE} darkMode={dm} initialData={a.traffic} />
      </div>

      {/* Recent Orders + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')}
              className={`text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1 ${dm ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-1.5">
            {recentOrders.map((o) => (
              <div key={o.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${dm ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dm ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'}`}><ShoppingBag size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{o.user?.fullName || 'Customer'}</p>
                    <p className={`text-[10px] font-medium ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{o.status} · {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold">₹{parseFloat(o.total).toLocaleString('en-IN')}</p>
                  <p className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className={`text-center py-8 text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No orders yet</p>}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-base font-bold mb-5">Order Status</h3>
          <div className="space-y-4">
            {(a.statusDistribution || []).map((d) => (
              <div key={d.status}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{d.status}</span>
                  <span className="text-xs font-bold">{d._count}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max((d._count / (a.totalOrders || 1)) * 100, 2)}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className={`h-full rounded-full ${statusColors[d.status] || 'bg-gray-400'}`} />
                </div>
              </div>
            ))}
            {(!a.statusDistribution || a.statusDistribution.length === 0) && (
              <p className={`text-center py-6 text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No order data</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className={card}>
          <div className="mb-5">
            <h3 className="text-base font-bold">Top Performing Products</h3>
            <p className={`text-xs mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Highest grossing items all-time</p>
          </div>
          <div className="space-y-4">
            {(a.topProducts || []).map((p, i) => {
               const maxRev = (a.topProducts[0]?.revenue || 1);
               const pct = (p.revenue / maxRev) * 100;
               return (
                 <div key={i} className="group cursor-default">
                   <div className="flex justify-between items-center mb-1.5 min-w-0 gap-4">
                     <span className={`text-xs font-bold truncate ${dm ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'} transition-colors`}>{p.name}</span>
                     <div className="text-right flex-shrink-0">
                       <span className="text-xs font-bold">₹{p.revenue.toLocaleString('en-IN')}</span>
                       <span className={`inline-block w-12 text-right text-[10px] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{p.sold} sold</span>
                     </div>
                   </div>
                   <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                     <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 1)}%` }}
                       transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                       className={`h-full rounded-full ${dm ? 'bg-indigo-500' : 'bg-indigo-500'}`} />
                   </div>
                 </div>
               );
            })}
            {(!a.topProducts || a.topProducts.length === 0) && <p className={`text-center py-4 text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No sales data</p>}
          </div>
        </div>

        {/* Payment Gateways */}
        <div className={card}>
          <div className="mb-5">
            <h3 className="text-base font-bold">Payment Gateways</h3>
            <p className={`text-xs mt-0.5 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Successful transactions by method</p>
          </div>
          <div className="space-y-4">
            {(a.paymentMethods || []).sort((x, y) => y._count - x._count).map((m, i) => {
               const totalPay = a.paymentMethods.reduce((s, item) => s + item._count, 0) || 1;
               const pt = (m._count / totalPay) * 100;
               // Colors mapping to methods
               const methodColors = { STRIPE: '#6366f1', PAYPAL: '#3b82f6', CARD: '#8b5cf6', CASH: '#10b981' };
               const color = methodColors[m.method] || '#9ca3af';
               return (
                 <div key={m.method} className="cursor-default">
                   <div className="flex justify-between items-center mb-1.5">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                       <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{m.method}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-bold">{m._count}</span>
                       <span className={`inline-block w-8 text-right text-[10px] font-bold ${dm?'text-gray-600':'text-gray-400'}`}>{pt.toFixed(0)}%</span>
                     </div>
                   </div>
                   <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                     <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(pt, 1.5)}%` }}
                       transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                       className="h-full rounded-full" style={{ background: color }} />
                   </div>
                 </div>
               );
            })}
            {(!a.paymentMethods || a.paymentMethods.length === 0) && <p className={`text-center py-4 text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>No payment data</p>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardTab;
