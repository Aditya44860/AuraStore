import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aurastore-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState([]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('aurastore-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load wishlist from database when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isLoggedIn, user]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
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
    }
  };

  const addToCart = (product, size = 'M') => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const addToWishlist = async (product) => {
    if (!isLoggedIn) {
      alert('Please login to add items to wishlist');
      return;
    }
    
    // Optimistically update UI first
    const exists = wishlistItems.find(item => item.id === product.id);
    if (exists) return;
    
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
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Revert on error
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
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
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};