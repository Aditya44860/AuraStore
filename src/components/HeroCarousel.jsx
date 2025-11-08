import { useState, useEffect, useRef } from "react";

function HeroCarousel() {
  const slides = [
    {
      id: 1,
      title: "New Collection 2024",
      subtitle: "Discover the latest trends",
      bg: "bg-gradient-to-br from-black to-gray-800",
    },
    {
      id: 2,
      title: "Summer Sale",
      subtitle: "Up to 50% off on selected items",
      bg: "bg-gradient-to-br from-gray-900 to-black",
    },
    {
      id: 3,
      title: "Premium Quality",
      subtitle: "Crafted with finest materials",
      bg: "bg-gradient-to-br from-black to-gray-700",
    },
    {
      id: 4,
      title: "Exclusive Drops",
      subtitle: "Limited edition streetwear collection",
      bg: "bg-gradient-to-br from-gray-800 to-black",
    },
    {
      id: 5,
      title: "Free Shipping",
      subtitle: "On orders above $99 worldwide",
      bg: "bg-gradient-to-br from-black to-gray-900",
    },
  ];

  const extendedSlides = [...slides, ...slides, ...slides];
  const [index, setIndex] = useState(slides.length);
  const [transition, setTransition] = useState(true);
  const intervalRef = useRef(null);

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 5000);
  };

  const goToNext = () => {
    setIndex((prev) => prev + 1);
    resetInterval();
  };

  const goToPrev = () => {
    setIndex((prev) => prev - 1);
    resetInterval();
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (index === slides.length * 2) {
      setTimeout(() => {
        setTransition(false);
        setIndex(slides.length);
      }, 1000);
      setTimeout(() => {
        setTransition(true);
      }, 1100);
    } else if (index === 0) {
      setTimeout(() => {
        setTransition(false);
        setIndex(slides.length);
      }, 1000);
      setTimeout(() => {
        setTransition(true);
      }, 1100);
    }
  }, [index, slides.length]);

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div
        className={`flex h-full ${
          transition ? "transition-transform duration-1000 ease-in-out" : ""
        }`}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {extendedSlides.map((slide, i) => (
          <div
            key={`${slide.id}-${i}`}
            className={`w-full h-full flex-shrink-0 ${slide.bg} flex items-center justify-center text-white`}
          >
            <div className="text-center px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{slide.title}</h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8">{slide.subtitle}</p>
              <button className="relative px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden">
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i + slides.length)}
            className={`w-3 h-3 rounded-full transition ${
              i === ((index - slides.length) % slides.length + slides.length) % slides.length
                ? "bg-white"
                : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
