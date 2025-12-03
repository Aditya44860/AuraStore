# AuraStore API Reference

## API Endpoints

| Endpoint | Method | Description | File Declared | Used In |
|----------|--------|-------------|---------------|----------|
| `/api/auth/register` | POST | Register a new user account | `server/server.js` | `src/pages/Signup.jsx` |
| `/api/auth/login` | POST | Login user and get JWT token | `server/server.js` | `src/pages/Login.jsx` |
| `/api/auth/me` | GET | Get current logged-in user profile | `server/server.js` | `src/context/AuthContext.jsx`, `src/pages/Profile.jsx` |
| `/api/auth/update-profile` | PUT | Update user profile information | `server/server.js` | `src/pages/Profile.jsx` |
| `/api/subscribe` | POST | Subscribe to newsletter | `server/server.js` | `src/pages/Home.jsx` |
| `/api/products` | GET | Get all products with pagination | `server/server.js` | `src/pages/AllProducts.jsx` |
| `/api/products/search` | GET | Search products by name, category, subcategory | `server/server.js` | `src/components/SearchBox.jsx`, `src/pages/SearchResults.jsx` |
| `/api/products/category/:categoryName` | GET | Get products by category | `server/server.js` | `src/pages/UpperWear.jsx`, `src/pages/BottomWear.jsx`, `src/pages/Sneakers.jsx` |
| `/api/products/sale` | GET | Get products on sale | `server/server.js` | `src/pages/Sale.jsx` |
| `/api/products/:id` | GET | Get single product by ID | `server/server.js` | `src/pages/ProductPage.jsx` |
| `/api/categories` | GET | Get all categories | `server/server.js` | `src/components/Navbar.jsx`, `src/pages/Home.jsx` |
| `/api/wishlist` | GET | Get user's wishlist items | `server/server.js` | `src/pages/Wishlist.jsx`, `src/context/CartContext.jsx` |
| `/api/wishlist` | POST | Add product to wishlist | `server/server.js` | `src/components/ProductCard.jsx`, `src/pages/ProductPage.jsx` |
| `/api/wishlist/:productId` | DELETE | Remove product from wishlist | `server/server.js` | `src/pages/Wishlist.jsx`, `src/components/ProductCard.jsx` |
| `/api/cart` | GET | Get user's cart items | `server/server.js` | `src/pages/Cart.jsx`, `src/context/CartContext.jsx` |
| `/api/cart` | POST | Add product to cart | `server/server.js` | `src/components/SizeModal.jsx`, `src/pages/ProductPage.jsx` |
| `/api/cart/:itemId` | PUT | Update cart item quantity | `server/server.js` | `src/pages/Cart.jsx` |
| `/api/cart/:itemId` | DELETE | Remove item from cart | `server/server.js` | `src/pages/Cart.jsx` |
| `/api/users` | GET | Get all registered users | `server/server.js` | Admin/Development tools |

## Authentication

Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Protected endpoints: `/api/auth/me`, `/api/auth/update-profile`, `/api/wishlist/*`, `/api/cart/*`
