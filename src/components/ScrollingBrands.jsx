

function ScrollingBrands() {
  const marketplaces = [
    { name: "AMAZON", logo: "/brands/amazon.png" },
    { name: "MYNTRA", logo: "/brands/Myntra.png" },
    { name: "NYKAA", logo: "/brands/nykaa.png" },
    { name: "FLIPKART", logo: "/brands/FlipKart.png" },
    { name: "AJIO", logo: "/brands/ajio.png" },
    { name: "TATA CLIQ", logo: "/brands/Tata-Cliq.png" },
  ];

  return (
    <div className="relative w-full bg-transparent py-6 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="flex animate-infinite-scroll whitespace-nowrap items-center">
        {[...marketplaces, ...marketplaces].map((brand, i) => (
          <div
            key={i}
            className="mx-14 flex items-center justify-center h-14 w-28 flex-shrink-0"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="max-h-full max-w-full object-contain opacity-40 grayscale filter hover:opacity-70 hover:grayscale-0 transition-all duration-700"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-infinite-scroll {
          display: inline-flex;
          animation: infinite-scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ScrollingBrands;
