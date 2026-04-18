import React from 'react';

/**
 * BnwBackground - A premium black and white aesthetic background
 * featuring subtle grain, soft mesh gradients, and minimalist accents.
 */
const BnwBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#fafafa] overflow-hidden transition-colors duration-700">
      {/* 0. Cinematic Vignette (Soft Highlighting) */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,_transparent_10%,_rgba(0,0,0,0.12)_100%)] pointer-events-none" />
      <div className="absolute inset-0 z-10 backdrop-blur-[2px] [mask-image:radial-gradient(circle_at_center,transparent_30%,black_100%)] pointer-events-none" />

      {/* 1. Enhanced Grain & Texture */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 2. PERSPECTIVE GRID: Breaking Uniformity */}
      <div className="absolute inset-0 opacity-[0.1]" style={{ perspective: '1000px' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          transform: 'rotateX(55deg) scale(2.5)',
          transformOrigin: 'top',
          maskImage: 'linear-gradient(to bottom, black, transparent)'
        }} />
      </div>

      {/* 3. Bold Geometric & Branding Layer */}
      <div className="absolute top-[-30%] right-[-20%] w-[100vw] h-[100vw] rounded-full border-[0.5px] border-black/[0.1]" />
      <div className="absolute bottom-[5%] left-0 w-full flex flex-col gap-2.5 opacity-[0.14]">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-full h-[0.5px] bg-black" />
        ))}
      </div>

      {/* 4. TECH-GREEN INJECTIONS: System Logs */}
      <div className="absolute top-[28%] left-14 flex flex-col gap-1.5 opacity-[0.6] font-mono text-[7px] select-none text-emerald-600">
        <span className="flex items-center gap-1.5">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
          > STATUS: SYSTEM_OPTIMIZED
        </span>
        <span>> KERNEL_LOAD : 0x00FF41</span>
        <span>> REA_RELEASE : v3.0.4 [STA]</span>
        <span className="text-gray-400 opacity-60">> TRACE_ROUTE : COMPLETED</span>
      </div>

      {/* 5. Isometric Circuitry & Axis */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" viewBox="0 0 1000 1000">
        <path d="M100,100 L200,100 L250,150 L250,300 M800,800 L700,800 L650,750 L650,600" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-900" />
        <circle cx="100" cy="100" r="3" fill="currentColor" className="text-emerald-500" />
      </svg>

      {/* 6. Registration Corners with Green Accents */}
      <div className="absolute inset-0 flex justify-between p-6 opacity-[0.25] font-mono text-[10px] text-gray-900/70 pointer-events-none uppercase tracking-[0.3em]">
        <div className="flex flex-col justify-between h-full">
          <span className="text-emerald-700">AURA_SEC_A</span>
          <span>AURA_SEC_B</span>
        </div>
        <div className="flex flex-col justify-between h-full items-end">
          <span>ID://X-992</span>
          <span className="text-emerald-700">STATUS_01</span>
        </div>
      </div>

      {/* 7. Central Branding Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
        <img src="/final_logo_2.png" alt="" className="w-[60%] max-w-5xl invert grayscale opacity-60 mix-blend-multiply" />
      </div>

      <div className="absolute bottom-20 left-[4%] select-none opacity-[0.045] font-extralight text-[18vw] tracking-[-0.12em] leading-none text-black">
        AURA STORE
      </div>

      {/* 8. Technical Callouts with Green Glow */}
      <div className="absolute top-10 left-10 font-mono text-[10px] text-gray-800/80 uppercase tracking-[0.5em] font-bold">
        AUR_PRM_SPEC_SHEET <br />
        <span className="text-emerald-600 font-bold opacity-90 shadow-[0_0_8px_rgba(16,185,129,0.2)]">ALPHA_3.0_RELEASE</span>
      </div>

      <div className="absolute bottom-10 right-10 font-mono text-[10px] text-gray-800/70 uppercase tracking-[0.2em] text-right">
        [ <span className="text-emerald-600 animate-pulse font-bold">STABLE</span> ] <br />
        CORE_RELEASE_BNW
      </div>
    </div>
  );
};

export default BnwBackground;
