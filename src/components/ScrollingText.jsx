function ScrollingText() {
  const messages = [
    "PREMIUM QUALITY",
    "TRENDY FASHION",
    "EASY RETURNS",
    "100% CUSTOMER SATISFACTION",
    "Cash On Delivery",
    "Unique Designs",
  ];

  // Create enough duplicates for seamless loop
  const repeatedMessages = Array(8).fill(messages).flat();

  return (
    <div className="relative bg-black py-3 overflow-hidden">
      <div className="flex items-center whitespace-nowrap animate-marquee">
        {repeatedMessages.map((message, index) => (
          <div key={index} className="mx-8">
            <span className="text-sm tracking-wider font-semibold text-white/80 hover:text-white transition">
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
      `}</style>
    </div>
  );
}

export default ScrollingText;
