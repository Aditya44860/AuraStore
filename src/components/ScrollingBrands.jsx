

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

      <div className="flex animate-infinite-scroll whitespace-nowrap items-center">
        {[...marketplaces, ...marketplaces].map((brand, i) => (
          <div
            key={i}
            className="mx-12 flex items-center justify-center h-16 w-32"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="max-h-full max-w-full object-contain opacity-60 grayscale filter"
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
          animation: infinite-scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ScrollingBrands;
