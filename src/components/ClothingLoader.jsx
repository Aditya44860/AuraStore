function ClothingLoader() {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="text-center">
        {/* AuraStore Logo */}
        <div className="mb-10">
          <img 
            src="/final_logo_2.png" 
            alt="AuraStore" 
            className="h-14 mx-auto opacity-80"
          />
        </div>
        
        {/* Tagline with dots */}
        <div className="flex items-baseline justify-center text-[15px] text-gray-400 mb-8 font-light tracking-wide">
          <span>Bringing you the good stuff</span>
          <div className="flex items-end ml-1 space-x-0.5 pb-1">
            <div 
              className="bg-gray-400 rounded-full"
              style={{ 
                width: '2.5px',
                height: '2.5px',
                animation: 'smallBounce 1.4s ease-in-out infinite',
                animationDelay: '1000ms'
              }}
            />
            <div 
              className="bg-gray-400 rounded-full"
              style={{ 
                width: '2.5px',
                height: '2.5px',
                animation: 'smallBounce 1.4s ease-in-out infinite',
                animationDelay: '1200ms'
              }}
            />
            <div 
              className="bg-gray-400 rounded-full"
              style={{ 
                width: '2.5px',
                height: '2.5px',
                animation: 'smallBounce 1.4s ease-in-out infinite',
                animationDelay: '1400ms'
              }}
            />
          </div>
        </div>
        
        <style>{`
          @keyframes smallBounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-6px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ClothingLoader;