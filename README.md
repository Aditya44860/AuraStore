# AuraStore

A modern, full-stack e-commerce platform for streetwear and fashion apparel built with React and Node.js.

## 🎯 Project Goal

Build a complete e-commerce solution with user authentication, product browsing, cart management, wishlist functionality, and real-time search capabilities. The platform provides a seamless shopping experience with server-side pagination, filtering, and sorting.

## ✨ Features

### User Features
- **Authentication System**: Secure JWT-based login/signup with bcrypt password hashing
- **Product Browsing**: Browse products by categories (Upper Wear, Bottom Wear, Sneakers, Sale)
- **Advanced Search**: Real-time search with debouncing and backend filtering
- **Shopping Cart**: Add/remove items with size selection and quantity management
- **Wishlist**: Save favorite products for later
- **User Profile**: Update personal information and view account details
- **Responsive Design**: Fully responsive UI for mobile, tablet, and desktop

### Technical Features
- **Server-Side Operations**: Pagination, filtering, and sorting handled on backend
- **Optimistic Updates**: Instant UI feedback with background sync
- **Modal System**: Centered modals using React Portals
- **Video Carousel**: Auto-playing hero section with smooth transitions
- **Email Integration**: Newsletter subscription with EmailJS
- **Database**: PostgreSQL with Prisma ORM

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **clsx & tailwind-merge** - Conditional class management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **EmailJS** - Email service integration

### Development Tools
- **ESLint** - Code linting
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
AuraStore/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── SearchBox.jsx
│   │   ├── SizeModal.jsx
│   │   └── ...
│   ├── pages/            # Route pages
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── AllProducts.jsx
│   │   ├── UpperWear.jsx
│   │   ├── BottomWear.jsx
│   │   ├── Sneakers.jsx
│   │   ├── Sale.jsx
│   │   └── ...
│   ├── context/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   └── lib/              # Utility functions
│       └── utils.js
├── server/
│   └── server.js         # Express API server
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:categoryName` - Get products by category
- `GET /api/products/sale` - Get sale products
- `GET /api/products/search` - Search products

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist

### Other
- `POST /api/subscribe` - Newsletter subscription
- `GET /api/categories` - Get all categories


## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL
```

### Backend (.env)
```
DATABASE_URL
JWT_SECRET
PORT
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

## 🌐 Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon Db PostgreSQL


## 👨‍💻 Developer

Built with ❤️ by Aditya
