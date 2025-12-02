import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Toast from '../components/Toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [pendingOperations, setPendingOperations] = useState(new Set());
  const [isFetchingCart, setIsFetchingCart] = useState(false);

  // Load cart and wishlist from database when user logs in
  useEffect(() => {
    if (authLoading) return;
    
    const initData = async () => {
      if (isLoggedIn && user?.email) {
        await Promise.all([fetchCart(), fetchWishlist()]);
      } else {
        setCartItems([]);
        setWishlistItems([]);
        setIsLoadingCart(false);
        setIsLoadingWishlist(false);
      }
    };
    initData();
  }, [isLoggedIn, user, authLoading]);

  const fetchCart = async (showLoading = true) => {
    if (isFetchingCart) return;
    setIsFetchingCart(true);
    if (showLoading) setIsLoadingCart(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingCart(false);
        setIsFetchingCart(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedItems = data.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          cartItemId: item.id
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      if (showLoading) setIsLoadingCart(false);
      setIsFetchingCart(false);
    }
  };

  const fetchWishlist = async () => {
    setIsLoadingWishlist(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingWishlist(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const addToCart = async (product, size = 'M') => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    // Optimistically update UI
    const existingItem = cartItems.find(item => item.id === product.id && item.size === size);
    if (existingItem) {
      setCartItems(prev => prev.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems(prev => [...prev, { ...product, size, quantity: 1, cartItemId: 'temp' }]);
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, size, quantity: 1 })
      });
      
      if (response.ok) {
        await fetchCart();
      } else {
        // Revert on failure
        await fetchCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      await fetchCart();
    }
  };

  const removeFromCart = async (productId, size) => {
    if (!isLoggedIn) return;
    
    const item = cartItems.find(i => i.id === productId && i.size === size);
    if (!item) return;
    
    const opKey = `remove-${productId}-${size}`;
    if (pendingOperations.has(opKey)) return;
    
    setPendingOperations(prev => new Set(prev).add(opKey));
    setCartItems(prev => prev.filter(i => !(i.id === productId && i.size === size)));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${item.cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        await fetchCart(false);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      await fetchCart(false);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(opKey);
        return newSet;
      });
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (!isLoggedIn) return;
    
    const item = cartItems.find(i => i.id === productId && i.size === size);
    if (!item) return;
    
    const opKey = `update-${productId}-${size}`;
    if (pendingOperations.has(opKey)) return;
    
    setPendingOperations(prev => new Set(prev).add(opKey));
    
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => !(i.id === productId && i.size === size)));
    } else {
      setCartItems(prev => prev.map(i =>
        i.id === productId && i.size === size ? { ...i, quantity } : i
      ));
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${item.cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) {
        await fetchCart(false);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      await fetchCart(false);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(opKey);
        return newSet;
      });
    }
  };

  const addToWishlist = async (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    
    // Optimistically update UI first
    const exists = wishlistItems.find(item => item.id === product.id);
    if (exists) return true;
    
    setWishlistItems(prev => [...prev, product]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id })
      });
      
      if (!response.ok) {
        // Revert on failure
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Revert on error
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn) return;
    
    // Optimistically update UI first
    const removedItem = wishlistItems.find(item => item.id === productId);
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok && removedItem) {
        // Revert on failure
        setWishlistItems(prev => [...prev, removedItem]);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Revert on error
      if (removedItem) {
        setWishlistItems(prev => [...prev, removedItem]);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const isItemPending = (productId, size) => {
    return pendingOperations.has(`remove-${productId}-${size}`) || 
           pendingOperations.has(`update-${productId}-${size}`);
  };

  const value = {
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getCartTotal,
    getCartCount,
    getWishlistCount,
    showLoginModal,
    closeLoginModal,
    isLoadingCart,
    isLoadingWishlist,
    isItemPending,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast 
        message="Added to cart successfully!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">Please login to add items to your cart and wishlist</p>
            <div className="flex gap-3">
              <button
                onClick={closeLoginModal}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-300 hover:text-black transition"
              >
                Cancel
              </button>
              <a
                href={`/login?from=${encodeURIComponent(window.location.pathname)}`}
                className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition text-center"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};