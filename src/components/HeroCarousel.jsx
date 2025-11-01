import { useState, useEffect, useRef } from 'react'

function HeroCarousel() {
  const slides = [
    { id: 1, title: 'New Collection 2024', subtitle: 'Discover the latest trends', bg: 'bg-gradient-to-r from-purple-600 to-blue-600' },
    { id: 2, title: 'Summer Sale', subtitle: 'Up to 50% off on selected items', bg: 'bg-gradient-to-r from-orange-500 to-red-600' },
    { id: 3, title: 'Premium Quality', subtitle: 'Crafted with finest materials', bg: 'bg-gradient-to-r from-green-600 to-teal-600' },
    { id: 4, title: 'Exclusive Drops', subtitle: 'Limited edition streetwear collection', bg: 'bg-gradient-to-r from-pink-600 to-purple-600' },
    { id: 5, title: 'Free Shipping', subtitle: 'On orders above $99 worldwide', bg: 'bg-gradient-to-r from-indigo-600 to-cyan-600' }
  ]

  const extendedSlides = [...slides, ...slides]
  const [index, setIndex] = useState(0)
  const [transition, setTransition] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex(prev => prev + 1)
    }, 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (index === slides.length) {
      setTimeout(() => {
        setTransition(false)
        setIndex(0)
      }, 1000)
      setTimeout(() => {
        setTransition(true)
      }, 1100)
    }
  }, [index, slides.length])

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div
        className={`flex h-full ${transition ? 'transition-transform duration-1000 ease-in-out' : ''}`}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {extendedSlides.map((slide, i) => (
          <div
            key={`${slide.id}-${i}`}
            className={`w-full h-full flex-shrink-0 ${slide.bg} flex items-center justify-center text-white`}
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
              <p className="text-xl mb-8">{slide.subtitle}</p>
              <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>


      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition ${
              i === (index % slides.length) ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
