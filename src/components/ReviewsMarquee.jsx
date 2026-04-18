import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const REVIEW_TEMPLATES = {
  sneakers: [
    "The cushioning is next level. Perfectly balances style and performance.",
    "Best pair for daily wear. The grip on these is surprisingly good.",
    "Obsessed with the silhouette of these shoes. Quality is insane.",
    "Never felt sneakers this light but durable. Pure premium vibe.",
    "The detail on these shoes is incredible. Worth every penny.",
    "A perfect mix of class and comfort. My feet have never felt better.",
    "The traction is amazing. Great for both gym and casual outings.",
    "Build quality is top-tier. These feel like they'll last for years.",
    "The colorway is even better in person. Real head-turners.",
    "Sophisticated design with unmatched comfort. A high-end staple."
  ],
  hoodies: [
    "The fabric weight is perfect. Best oversized fit I've found so far.",
    "Incredibly soft material and the wash quality holds up well.",
    "Minimalist design at its best. This hoodie is now my daily driver.",
    "The fit is exactly what I wanted. Not too baggy, just the right amount of oversized.",
    "Superior warmth and the stitching is super clean. Premium streetwear.",
    "Heavyweight feel that screams luxury. The hood shape is perfect.",
    "Attention to detail in the ribbing and cuffs is impressive. 10/10.",
    "Clean, understated, and incredibly comfortable. The ultimate essential.",
    "Doesn't lose its shape after washing. Real studio-quality apparel.",
    "The texture of the inner fleece is so soft. Never taking it off."
  ],
  "upper wear": [
    "The quality of the fabric is unmatched. Definitely my new favorite store.",
    "Great fit and the minimalistic is exactly what I was looking for.",
    "Love the fabric weight. Feels very high-end and breathable.",
    "The stitching and finish are top-tier. Global streetwear vibes.",
    "Fast delivery and the packaging was super premium.",
    "The drape of this is perfect. Clearly premium construction.",
    "The silhouette is modern and flattering. Really elevates the fit.",
    "Breathable material that feels luxurious against the skin.",
    "Subtle branding that keeps it classy. Exactly the aesthetic I love.",
    "Each piece feels like it was custom made. Exceptional quality control."
  ],
  "bottom wear": [
    "The silhouette on these is perfection. Very versatile.",
    "Durable material and the fit is incredibly comfortable for all-day wear.",
    "Best fit I've owned in a while. The fabric feels premium.",
    "Love the pocket placement and the overall aesthetic.",
    "Perfect for a clean, classy look. High-end quality.",
    "The movement in these is great. Not restrictive at all.",
    "Strong seams and hardware. These are built to withstand anything.",
    "The fit is spot on. Works with both sneakers and boots.",
    "Premium cotton blend that holds its color and shape perfectly.",
    "Clean lines and a bold silhouette. A must-have for any wardrobe."
  ],
  general: [
    "Fast delivery and premium packaging. The Aura is real and it's bold.",
    "Obsessed with the minimalist aesthetic. A must-buy for any collector.",
    "AuraStore is a game changer for the Indian streetwear scene.",
    "Everything about this order felt high-end. From the site to the unboxing.",
    "The attention to detail in every piece is what keeps me coming back.",
    "Customer support was incredibly helpful. A truly premium service.",
    "The unboxing experience alone is worth it. Pure studio luxury.",
    "Top-tier curation. Every item feels intentional and high-quality.",
    "Finally, a brand that prioritizes both aesthetic and durability.",
    "Global standards met right here. I'm officially a fan."
  ]
};

const RANDOM_NAMES = [
  "Aryan S.", "Ishan K.", "Tanya M.", "Riya P.", "Kabir R.",
  "Zoya H.", "Arjun V.", "Manya L.", "Dev R.", "Kiara G.",
  "Sameer W.", "Ananya B.", "Rohan M.", "Sia P.", "Vihan D.",
  "Naira K.", "Advait G.", "Myra S.", "Kabir T.", "Anvi L."
];

function ReviewsMarquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchDiverseProducts = async () => {
      try {
        const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
        const catData = await catRes.json();
        if (!catData.success) return;

        const productPromises = catData.categories.map(cat =>
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/category/${encodeURIComponent(cat.name)}?limit=6`)
            .then(r => r.json())
        );

        const results = await Promise.all(productPromises);
        const seenIds = new Set();
        let allProducts = results
          .flatMap(res => res.success ? res.products : [])
          .filter(p => {
            if (!p.id || seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
          });

        allProducts = allProducts
          .filter(p => p.imageUrl)
          .sort(() => Math.random() - 0.5);

        // Track used templates to ensure uniqueness
        const usedTemplates = {
          sneakers: [], hoodies: [], "upper wear": [], "bottom wear": [], general: []
        };
        const usedNames = [];

        const paired = allProducts.map((product) => {
          const category = product.category?.name?.toLowerCase() || "";
          const subcategory = product.subcategory?.toLowerCase() || "";

          let type = "general";
          if (subcategory.includes("sneaker")) type = "sneakers";
          else if (subcategory.includes("hoodie")) type = "hoodies";
          else if (category.includes("upper")) type = "upper wear";
          else if (category.includes("bottom")) type = "bottom wear";

          let templates = REVIEW_TEMPLATES[type];

          // Selection logic to avoid repetition
          let availableTemplates = templates.filter(t => !usedTemplates[type].includes(t));
          if (availableTemplates.length === 0) {
            usedTemplates[type] = []; // Reset if we've used all
            availableTemplates = templates;
          }
          const randomText = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
          usedTemplates[type].push(randomText);

          let availableNames = RANDOM_NAMES.filter(n => !usedNames.includes(n));
          if (availableNames.length === 0) {
            usedNames.length = 0; // Reset
            availableNames = RANDOM_NAMES;
          }
          const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
          usedNames.push(randomName);

          const randomRating = Math.random() > 0.3 ? 5 : 4;

          return {
            id: product.id,
            productImage: product.imageUrl,
            name: randomName,
            rating: randomRating,
            text: randomText
          };
        });

        setItems(paired);
      } catch (err) {
        console.error("Error fetching diverse products for marquee:", err);
      }
    };

    fetchDiverseProducts();
  }, []);

  if (items.length === 0) return null;

  // Triple for extra smoothness in loop
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full bg-white py-12 overflow-hidden select-none">
      {/* Side Gradients for fading effect */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

      <div className="flex w-fit animate-marquee-belt hover:[animation-play-state:paused] cursor-pointer px-4">
        {displayItems.map((item, i) => (
          <Link
            key={i}
            to={`/product/${item.id}`}
            className="w-[300px] h-[500px] sm:w-[380px] sm:h-[580px] mx-3 sm:mx-4 rounded-3xl overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 group block"
          >
            {/* Product Image Section - Top half */}
            <div className="h-[45%] sm:h-[50%] w-full overflow-hidden relative bg-gray-50">
              <img
                src={item.productImage}
                alt=""
                className="w-full h-full object-cover grayscale opacity-40 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-20" />
            </div>

            {/* Padding/Spaced Divider */}
            <div className="h-px w-full bg-gray-50" />

            {/* Review Content - Bottom half with padding */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between bg-white relative z-10">
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(item.rating)].map((_, idx) => (
                    <svg key={idx} className="w-3.5 h-3.5 text-gray-900 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-900 text-[15px] sm:text-[17px] font-extralight tracking-tight leading-relaxed italic">
                  "{item.text}"
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-900/5">
                <p className="text-gray-900 text-[11px] font-bold uppercase tracking-widest">{item.name}</p>
                <p className="text-gray-400 text-[9px] uppercase tracking-widest mt-1">Verified Experience</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes marquee-belt {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee-belt {
          animation: marquee-belt 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ReviewsMarquee;
