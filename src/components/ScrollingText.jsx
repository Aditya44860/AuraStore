function ScrollingText() {
  const messages = [
    "PREMIUM QUALITY",
    "TRENDY FASHION",
    "EASY RETURNS",
    "100% CUSTOMER SATISFACTION",
    "CASH ON DELIVERY",
    "UNIQUE DESIGNS",
  ];

  // Create enough duplicates for seamless loop
  const repeatedMessages = Array(8).fill(messages).flat();

  return (
    <div className="relative bg-black py-3 overflow-hidden group">
      <div className="flex items-center whitespace-nowrap animate-marquee group-hover:pause">
        {repeatedMessages.map((message, index) => (
          <div key={index} className="mx-8">
            <span className="text-sm tracking-wider font-semibold text-white/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition cursor-pointer">
              {message}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }

        .animate-marquee {
          display: inline-flex;
          animation: marquee 15s linear infinite;
        }
        
        .animate-marquee.pause {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default ScrollingText;
