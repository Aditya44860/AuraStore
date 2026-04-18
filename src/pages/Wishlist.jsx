import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Wishlist() {
  const { wishlistItems, removeFromWishlist, isLoadingWishlist } = useCart();
  const { isLoggedIn, loading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

          {(isLoadingWishlist || authLoading) ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="text-gray-600 mt-4 text-lg">Bringing your stuff...</p>
            </div>
          ) : !isLoggedIn ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-6">
                Please login to enjoy the wishlist feature
              </p>
              <Link
                to="/login"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Login
              </Link>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                Your wishlist is empty
              </p>
              <Link
                to="/all-products"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Explore More
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistItems.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={parseFloat(item.price)}
                  originalPrice={item.originalPrice ? parseFloat(item.originalPrice) : null}
                  image={item.imageUrl}
                  category={item.category}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
