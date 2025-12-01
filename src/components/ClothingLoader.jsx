function ClothingLoader() {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* AuraStore Logo */}
        <div className="mb-10">
          <img 
            src="/final_logo_2.png" 
            alt="AuraStore" 
            className="h-16 mx-auto"
          />
        </div>
        
        {/* Tagline with dots */}
        <div className="flex items-baseline justify-center text-lg text-gray-700 mb-8">
          <span>Bringing you the good stuff</span>
          <div className="flex items-end ml-1 space-x-0.5 pb-1">
            <div 
              className="bg-gray-700 rounded-full"
              style={{ 
                width: '3px',
                height: '3px',
                animation: 'smallBounce 1.2s ease-in-out infinite',
                animationDelay: '1000ms'
              }}
            ></div>
            <div 
              className="bg-gray-700 rounded-full"
              style={{ 
                width: '3px',
                height: '3px',
                animation: 'smallBounce 1.2s ease-in-out infinite',
                animationDelay: '1200ms'
              }}
            ></div>
            <div 
              className="bg-gray-700 rounded-full"
              style={{ 
                width: '3px',
                height: '3px',
                animation: 'smallBounce 1.2s ease-in-out infinite',
                animationDelay: '1400ms'
              }}
            ></div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes smallBounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ClothingLoader;