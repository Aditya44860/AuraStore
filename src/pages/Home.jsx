import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ScrollingBrands from "../components/ScrollingBrands";
import Shoe3DScene from "../components/Shoe3D";

/* ── Scroll-reveal word component ── */
function RevealWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.08, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.3em] will-change-transform">
      {children}
    </motion.span>
  );
}

function ScrollRevealText({ text, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.98", "start 0.5"],
  });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <RevealWord key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </RevealWord>
        );
      })}
    </p>
  );
}

/* ── Horizontal Product Banner ── */
function HorizontalProductBanner({ products, loading }) {
  const scrollRef = useRef(null);

  if (loading) {
    return (
      <div className="flex gap-5 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-[260px] sm:w-[280px] flex-shrink-0 animate-pulse">
            <div className="aspect-[3/4] bg-gray-100 rounded-xl mb-3" />
            <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-5 px-4 sm:px-6 lg:px-8 overflow-x-auto overflow-y-hidden hide-scrollbar snap-x snap-proximity scroll-smooth"
      style={{ overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch" }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="w-[260px] sm:w-[280px] flex-shrink-0 snap-start"
        >
          <ProductCard
            id={product.id}
            name={product.name}
            price={parseFloat(product.price)}
            originalPrice={product.originalPrice ? parseFloat(product.originalPrice) : null}
            image={product.imageUrl}
            gallery={product.gallery}
            category={product.category?.name}
          />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════ */
function Home() {
  const [email, setEmail] = useState("");
  const [showTick, setShowTick] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const philosophyRef = useRef(null);
  const videoRef = useRef(null);
  const beliefRef = useRef(null);

  // Hero parallax
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);

  // Philosophy parallax
  const { scrollYProgress: philScroll } = useScroll({
    target: philosophyRef,
    offset: ["start end", "end start"],
  });
  const philImageY = useTransform(philScroll, [0, 1], ["8%", "-8%"]);

  // Video section parallax
  const { scrollYProgress: videoScroll } = useScroll({
    target: videoRef,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(videoScroll, [0, 1], ["-10%", "10%"]);

  // Belief section — 3D shoe rotation
  const { scrollYProgress: beliefScroll } = useScroll({
    target: beliefRef,
    offset: ["start end", "end start"],
  });
  const scrollProgressRef = useRef(0);
  useMotionValueEvent(beliefScroll, "change", (v) => {
    scrollProgressRef.current = v;
  });

  // Fetch products
  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE_URL;

    // Shuffle helper
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // Fetch from multiple categories for diverse mix
    const fetchDiverse = async (setter, setLoading, sortBy = 'latest') => {
      try {
        const [upper, bottom, sneakers] = await Promise.all([
          fetch(`${API}/api/products/category/Upper Wear?page=1&limit=5&sortBy=${sortBy}`).then(r => r.json()),
          fetch(`${API}/api/products/category/Bottom Wear?page=1&limit=5&sortBy=${sortBy}`).then(r => r.json()),
          fetch(`${API}/api/products/category/Sneakers?page=1&limit=4&sortBy=${sortBy}`).then(r => r.json()),
        ]);
        const all = [
          ...(upper.success ? upper.products : []),
          ...(bottom.success ? bottom.products : []),
          ...(sneakers.success ? sneakers.products : []),
        ];
        setter(shuffle(all));
      } catch (err) {
        console.error('Error fetching diverse products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiverse(setNewArrivals, setLoadingNew, 'latest');
    fetchDiverse(setBestSellers, setLoadingBest, 'price-desc');
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setShowTick(true);
    const emailToSend = email;
    setEmail("");
    setTimeout(() => setShowTick(false), 2000);
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div ref={containerRef} className="bg-[#fafafa] min-h-screen selection:bg-gray-900 selection:text-white">

      {/* ═══════════════════════════════════════
          1. HERO — Image with Parallax
          ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden -mt-16 sm:-mt-20">
        <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury Fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-8"
          >
            <span className="inline-block text-white/50 uppercase tracking-[0.4em] text-[10px] md:text-[11px] font-light border border-white/15 px-6 py-2.5 rounded-full backdrop-blur-sm">
              Spring / Summer 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-white font-extralight tracking-[-0.03em] leading-[0.92] mb-8"
            style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
          >
            Elevate<br />Your Aura
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3, ease: "easeOut" }}
            className="text-white/40 text-sm md:text-[15px] font-light tracking-wide max-w-sm mb-14 leading-relaxed"
          >
            Premium streetwear designed for those who define their own standard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
          >
            <Link
              to="/all-products"
              className="group relative inline-flex items-center justify-center px-9 py-3.5 bg-white text-gray-900 overflow-hidden rounded-full text-[13px] tracking-wide"
            >
              <span className="relative z-10 flex items-center gap-2.5 group-hover:text-white transition-colors duration-500">
                Discover Collection
                <svg className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 h-full w-full bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left ease-[0.19,1,0.22,1]" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/30"
        >
          <span className="text-[9px] uppercase tracking-[0.35em] font-light">Scroll</span>
          <div className="w-[1px] h-14 bg-white/10 relative overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-white/50"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          2. ETHOS MARQUEE
          ═══════════════════════════════════════ */}
      <div className="bg-[#0a0a0a] py-5 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 md:px-10">
              <span className="text-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-light">Define your space</span>
              <span className="mx-6 md:mx-10 text-white/10 text-[8px]">◆</span>
              <span className="text-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-light">Uncompromising Quality</span>
              <span className="mx-6 md:mx-10 text-white/10 text-[8px]">◆</span>
              <span className="text-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-light">Modern Aesthetics</span>
              <span className="mx-6 md:mx-10 text-white/10 text-[8px]">◆</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }`}</style>

      {/* ═══════════════════════════════════════
          3. HORIZONTAL BANNER — New Arrivals
          ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="flex items-end justify-between"
          >
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-2 block font-light">Just Dropped</span>
              <h2 className="text-2xl sm:text-3xl md:text-[2.5rem] font-extralight tracking-tight text-gray-900">New Arrivals</h2>
            </div>
            <Link to="/all-products" className="group inline-flex items-center gap-3 text-[11px] font-normal uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors duration-500">
              View All
              <span className="w-6 h-[0.5px] bg-gray-300 group-hover:w-12 group-hover:bg-gray-900 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
        <HorizontalProductBanner products={newArrivals} loading={loadingNew} />
      </section>

      <section ref={beliefRef} className="py-28 sm:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#f5f5f7]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* 3D Rotating Shoe */}
            <div className="relative flex items-center justify-center order-1 lg:order-1">
              <div className="relative w-[320px] h-[380px] sm:w-[420px] sm:h-[480px] lg:w-[520px] lg:h-[520px]">
                {/* Circular orbit tracks */}
                <div className="absolute inset-[10%] rounded-full border border-gray-200/30 border-dashed pointer-events-none" />
                <div className="absolute inset-[22%] rounded-full border border-gray-200/20 border-dashed pointer-events-none" />
                {/* 3D Canvas */}
                <Shoe3DScene scrollProgress={scrollProgressRef} />
                {/* 100% Premium Quality badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="absolute bottom-[10%] right-0 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-lg shadow-black/5 border border-gray-100/50 z-10"
                >
                  <div className="text-xl font-extralight text-gray-900">100%</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-light">Premium Quality</div>
                </motion.div>
              </div>
            </div>

            {/* Text Side */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="order-2 lg:order-2 lg:pl-12"
            >
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-light mb-6 block">Our Belief</span>
              <h2 className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extralight text-gray-900 tracking-tight leading-[1.12] mb-8">
                Fashion should be<br />an extension of<br />who you are.
              </h2>
              <p className="text-gray-400 text-[15px] leading-[1.85] mb-10 font-light max-w-md">
                Not a costume you put on. Every piece we create is designed to let your true self shine through with confidence and quiet elegance.
              </p>
              <div className="space-y-6">
                {[
                  { num: "01", title: "Premium Materials", desc: "Sourced from the world's finest mills" },
                  { num: "02", title: "Enduring Design", desc: "Built to outlast trends, not follow them" },
                  { num: "03", title: "Perfect Craft", desc: "Obsessive attention to every single detail" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                    className="flex items-start gap-4"
                  >
                    <span className="text-[11px] text-gray-300 font-light mt-0.5 tracking-wider">{item.num}</span>
                    <div>
                      <span className="text-[13px] text-gray-800 font-normal tracking-wide block mb-0.5">{item.title}</span>
                      <span className="text-[12px] text-gray-400 font-light tracking-wide">{item.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. CINEMATIC VIDEO INTERLUDE
          ═══════════════════════════════════════ */}
      <section ref={videoRef} className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <motion.div style={{ y: videoY }} className="absolute inset-0 -top-[15%] -bottom-[15%]">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero_section/hero_vid4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white/40 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-light mb-6"
          >
            The Craft
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-white font-extralight tracking-tight leading-[1.1] mb-6"
            style={{ fontSize: "clamp(1.8rem, 5vw, 4rem)" }}
          >
            Where precision<br />meets passion.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/30 text-sm sm:text-[15px] font-light max-w-md leading-relaxed"
          >
            Every stitch. Every fabric. Every detail — obsessively considered.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. HORIZONTAL BANNER — Best Sellers
          ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="flex items-end justify-between"
          >
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-2 block font-light">Curated Selection</span>
              <h2 className="text-2xl sm:text-3xl md:text-[2.5rem] font-extralight tracking-tight text-gray-900">The Signature Edit</h2>
            </div>
            <Link to="/all-products" className="group inline-flex items-center gap-3 text-[11px] font-normal uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors duration-500">
              View All
              <span className="w-6 h-[0.5px] bg-gray-300 group-hover:w-12 group-hover:bg-gray-900 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
        <HorizontalProductBanner products={bestSellers} loading={loadingBest} />
      </section>

      {/* ═══════════════════════════════════════
          7. PHILOSOPHY — Cinematic Split
          ═══════════════════════════════════════ */}
      <section ref={philosophyRef} className="relative bg-[#f3f3f3] overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[650px]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col justify-center p-8 md:p-16 lg:p-24 order-2 lg:order-1"
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-light mb-6 block">Our Philosophy</span>
            <h2 className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extralight text-gray-900 tracking-tight leading-[1.15] mb-8">
              Crafted for the<br className="hidden lg:block" /> contemporary mind.
            </h2>
            <p className="text-gray-400 text-[15px] leading-[1.85] mb-12 max-w-md font-light">
              We focus on premium materials, architectural silhouettes, and enduring design. Every garment is rigorously tested to ensure perfection in fit and form.
            </p>
            <Link to="/all-products" className="group relative inline-flex items-center justify-center px-8 py-3.5 border border-gray-300 text-gray-900 overflow-hidden rounded-full text-[13px] max-w-fit w-fit tracking-wide hover:border-gray-900 transition-colors duration-500">
              <span className="relative z-10 group-hover:text-white transition-colors duration-500 font-light">Explore More</span>
              <div className="absolute inset-0 h-full w-full bg-gray-900 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.19,1,0.22,1]" />
            </Link>
          </motion.div>
          <div className="relative h-[400px] lg:h-auto overflow-hidden order-1 lg:order-2">
            <motion.div style={{ y: philImageY }} className="absolute -top-[10%] -bottom-[10%] left-0 right-0">
              <motion.img
                initial={{ scale: 1.08 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. SCROLL REVEAL — Numbers / Impact
          ═══════════════════════════════════════ */}
      <section className="py-28 sm:py-36 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <ScrollRevealText
            text="Premium fabrics sourced from the finest mills. Designed in-house. Built to outlast trends."
            className="text-xl sm:text-2xl md:text-[2rem] lg:text-[2.5rem] font-extralight text-white leading-[1.35] tracking-tight mb-20"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: "50+", label: "Premium Styles" },
              { number: "100%", label: "Quality Fabrics" },
              { number: "24h", label: "Fast Dispatch" },
              { number: "10K+", label: "Happy Customers" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-extralight text-white mb-2 tracking-tight">{stat.number}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/25 font-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9. COLLECTIONS — Category Grid
          ═══════════════════════════════════════ */}
      <section className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-20"
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-light mb-3 block">Shop by Category</span>
          <h2 className="text-3xl sm:text-4xl md:text-[3.2rem] font-extralight tracking-tight text-gray-900">Explore Collections</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }}>
            <Link to="/sneakers" className="group relative h-[400px] md:h-[520px] overflow-hidden rounded-2xl block">
              <motion.img whileHover={{ scale: 1.04 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} src="https://images.vegnonveg.com/resized/1360X1600/14956/jordan-air-jordan-1-retro-high-og-pale-ivorypsychic-blue-coconut-milk-69ba2de7b7b58.jpg?format=webp" alt="Sneakers" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-2xl sm:text-3xl font-light text-white mb-2 tracking-tight">Sneakers</h3>
                <span className="text-white/50 text-sm flex items-center gap-2 font-light tracking-wide group-hover:text-white/80 transition-colors duration-500">
                  Shop Collection
                  <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 gap-4">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.1 }}>
              <Link to="/upper-wear" className="group relative h-[200px] md:h-[252px] overflow-hidden rounded-2xl block">
                <motion.img whileHover={{ scale: 1.04 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} src="https://images.bewakoof.com/t1080/men-s-black-shine-hustle-typography-oversized-jacket-597145-1732876343-1.jpg" alt="Upper Wear" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6"><h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">Upper Wear</h3></div>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.2 }}>
              <Link to="/bottom-wear" className="group relative h-[200px] md:h-[252px] overflow-hidden rounded-2xl block">
                <motion.img whileHover={{ scale: 1.04 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} src="https://images.bewakoof.com/t1080/690782_2026-03-23t10-56-13_1.jpg" alt="Bottom Wear" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6"><h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">Bottom Wear</h3></div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          10. FEATURED IN
          ═══════════════════════════════════════ */}
      <section className="bg-white py-20 border-y border-gray-100/80 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-[1400px] mx-auto px-4 text-center mb-10">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-light">Featured In</span>
        </motion.div>
        <ScrollingBrands />
      </section>

      {/* ═══════════════════════════════════════
          11. NEWSLETTER
          ═══════════════════════════════════════ */}
      <section className="py-28 sm:py-36 px-4 bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/25 font-light mb-6 block">Stay Connected</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extralight mb-5 tracking-tight">Join the Inner Circle</h2>
            <p className="text-white/25 text-sm leading-relaxed mb-12 font-light max-w-sm mx-auto">
              Subscribe for early access to drops, exclusive previews, and special privileges.
            </p>
            <form onSubmit={handleSubscribe} className="relative max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full py-4 pl-6 pr-32 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all duration-500 text-sm font-light"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-gray-900 px-6 rounded-full text-[11px] uppercase tracking-[0.15em] hover:bg-gray-100 transition-all duration-300 flex items-center justify-center overflow-hidden font-normal"
              >
                <AnimatePresence mode="wait">
                  {showTick ? (
                    <motion.svg key="tick" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Subscribe</motion.span>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default Home;
