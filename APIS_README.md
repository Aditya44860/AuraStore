# AuraStore API Reference

## API Endpoints

| Endpoint | Method | Description | File Declared |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register a new user account | `server/server.js` |
| `/api/auth/login` | POST | Login user and get JWT token | `server/server.js` |
| `/api/auth/me` | GET | Get current logged-in user profile | `server/server.js` |
| `/api/auth/update-profile` | PUT | Update user profile information | `server/server.js` |
| `/api/subscribe` | POST | Subscribe to newsletter | `server/server.js` |
| `/api/products` | GET | Get all products with pagination | `server/server.js` |
| `/api/products/category/:categoryName` | GET | Get products by category | `server/server.js` |
| `/api/products/sale` | GET | Get products on sale | `server/server.js` |
| `/api/products/:id` | GET | Get single product by ID | `server/server.js` |
| `/api/categories` | GET | Get all categories | `server/server.js` |
| `/api/wishlist` | GET | Get user's wishlist items | `server/server.js` |
| `/api/wishlist` | POST | Add product to wishlist | `server/server.js` |
| `/api/wishlist/:productId` | DELETE | Remove product from wishlist | `server/server.js` |
| `/api/cart` | GET | Get user's cart items | `server/server.js` |
| `/api/cart` | POST | Add product to cart | `server/server.js` |
| `/api/cart/:itemId` | PUT | Update cart item quantity | `server/server.js` |
| `/api/cart/:itemId` | DELETE | Remove item from cart | `server/server.js` |
| `/api/users` | GET | Get all registered users | `server/server.js` |

## Authentication

Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Protected endpoints: `/api/auth/me`, `/api/auth/update-profile`, `/api/wishlist/*`, `/api/cart/*`
