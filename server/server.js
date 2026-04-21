const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const emailjs = require('@emailjs/nodejs');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

// Mandatory Config Validation
const REQUIRED_ENV_VARS = ["PORT", "ALLOWED_ORIGINS", "JWT_SECRET", "GEMINI_API_KEY"];
REQUIRED_ENV_VARS.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`CRITICAL: Missing mandatory environment variable: ${varName}`);
    process.exit(1);
  }
});

const prisma = new PrismaClient();

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "AuraStore Backend" });
});
const PORT = process.env.PORT; // Strict requirement
const JWT_SECRET = process.env.JWT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are an AI customer support bot for AuraStore. Your goal is to help users with their queries about the store, products, shipping, returns, and other policies. Use the provided company rules to answer queries accurately. If you don't know the answer, ask the user to contact support at support@aurastore.com. Be polite, professional, and helpful."
});

// Load company rules
let companyRules = "";
try {
  companyRules = fs.readFileSync(path.join(__dirname, 'company_rules.txt'), 'utf8');
} catch (error) {
  console.error("Error loading company rules:", error);
}

// Middleware - Strict CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) 
    // but validate against whitelist if present
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: name,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user.id, name: user.fullName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(400).json({ message: "Email not found !" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password !" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });


    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.fullName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Protected route example
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, name: user.fullName, email: user.email, fullName: user.fullName, phone: user.phone, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile endpoint
app.put("/api/auth/update-profile", verifyToken, async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { fullName, phone }
    });

    res.json({
      message: "Profile updated successfully",
      user: { id: updatedUser.id, name: updatedUser.fullName, email: updatedUser.email, fullName: updatedUser.fullName, phone: updatedUser.phone }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



// Subscribe endpoint
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Subscribe request received for:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Send email with EmailJS
    emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        to_name: 'Subscriber',
        from_name: 'AuraStore',
        reply_to: email
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY
      }
    ).then(() => {
      console.log('Email sent successfully to:', email);
    }).catch((err) => {
      console.error('Email failed:', err);
    });

    res.json({ message: "Subscription successful" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Subscription failed", error: error.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { subcategory, page = 1, limit = 9, sortBy = 'latest' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { isActive: true };
    if (subcategory) {
      whereClause.subcategory = subcategory;
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true
        },
        where: whereClause,
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      products: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category
app.get("/api/products/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { subcategory, page = 1, limit = 9, sortBy = 'latest' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      isActive: true,
      category: {
        name: {
          equals: categoryName,
          mode: 'insensitive'
        }
      }
    };

    if (subcategory) {
      whereClause.subcategory = subcategory;
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true
        },
        where: whereClause,
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      products: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get sale products with optional category filter
app.get("/api/products/sale", async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 9, sortBy = 'latest' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      isActive: true,
      isOnSale: true
    };

    if (category) {
      whereClause.category = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      };
    }

    if (subcategory) {
      whereClause.subcategory = subcategory;
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true
        },
        where: whereClause,
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      products: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get unique subcategories that have products on sale
app.get("/api/products/sale/subcategories", async (req, res) => {
  try {
    const productsOnSale = await prisma.product.findMany({
      where: {
        isOnSale: true,
        isActive: true
      },
      select: {
        subcategory: true
      },
      distinct: ['subcategory']
    });

    const subcategories = productsOnSale
      .map(p => p.subcategory)
      .filter(Boolean); // Remove null/undefined

    res.json({
      success: true,
      subcategories
    });
  } catch (error) {
    console.error("Error fetching sale subcategories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Search products
app.get("/api/products/search", async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, products: [] });
    }

    const searchTerm = q.toLowerCase();

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { subcategory: { contains: searchTerm, mode: 'insensitive' } },
          { category: { name: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      },
      include: {
        category: true
      },
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// REVIEWS ENDPOINTS (must be before /api/products/:id)
// =====================

// Get reviews for a product
app.get("/api/products/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        include: {
          user: {
            select: { id: true, fullName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({ where: { productId: id } })
    ]);

    res.json({
      success: true,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        title: r.title || null,
        comment: r.comment,
        createdAt: r.createdAt,
        user: { name: r.user.fullName }
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a review
app.post("/api/products/:id/reviews", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.userId, productId: id } }
    });

    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Build data - title field may not exist if migration hasn't run
    const reviewData = {
      rating,
      comment: comment || null,
      userId: req.userId,
      productId: id
    };
    // Try to include title if the column exists
    try {
      reviewData.title = title || null;
    } catch (e) { /* title column may not exist */ }

    const review = await prisma.review.create({
      data: reviewData,
      include: {
        user: { select: { fullName: true } }
      }
    });

    res.status(201).json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title || null,
        comment: review.comment,
        createdAt: review.createdAt,
        user: { name: review.user.fullName }
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    // If title column doesn't exist, retry without it
    if (error.message && error.message.includes('title')) {
      try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const review = await prisma.review.create({
          data: { rating, comment: comment || null, userId: req.userId, productId: id },
          include: { user: { select: { fullName: true } } }
        });
        return res.status(201).json({
          success: true,
          review: { id: review.id, rating: review.rating, title: null, comment: review.comment, createdAt: review.createdAt, user: { name: review.user.fullName } }
        });
      } catch (retryError) {
        console.error('Retry error:', retryError);
      }
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product by ID (with review stats)
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get review stats
    const reviews = await prisma.review.findMany({ where: { productId: id } });
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { ratingCounts[r.rating]++; });

    res.json({
      success: true,
      product: product,
      reviewStats: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviewCount,
        ratingCounts
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's wishlist
app.get("/api/wishlist", verifyToken, async (req, res) => {
  try {
    const favourites = await prisma.favouriteItems.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    res.json({
      success: true,
      items: favourites.map(fav => fav.product)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add item to wishlist
app.post("/api/wishlist", verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;

    const existingFav = await prisma.favouriteItems.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: productId
        }
      }
    });

    if (existingFav) {
      return res.json({ success: true, message: "Already in wishlist" });
    }

    await prisma.favouriteItems.create({
      data: {
        userId: req.userId,
        productId: productId
      }
    });

    res.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove item from wishlist
app.delete("/api/wishlist/:productId", verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;

    await prisma.favouriteItems.deleteMany({
      where: {
        userId: req.userId,
        productId: productId
      }
    });

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Helper to get full cart items
const getFullCartItems = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  });
  return cart ? cart.items : [];
};

// Get user's cart
app.get("/api/cart", verifyToken, async (req, res) => {
  try {
    const items = await getFullCartItems(req.userId);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add item to cart
app.post("/api/cart", verifyToken, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    let cart = await prisma.cart.findUnique({ where: { userId: req.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId,
          size: size || 'M'
        }
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size: size || 'M',
          quantity: quantity || 1
        }
      });
    }

    const items = await getFullCartItems(req.userId);
    res.json({ success: true, items, message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update cart item quantity
app.put("/api/cart/:itemId", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    }

    const items = await getFullCartItems(req.userId);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove item from cart
app.delete("/api/cart/:itemId", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    const items = await getFullCartItems(req.userId);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// (Review endpoints moved above /api/products/:id to avoid route conflict)

// GET Saved Addresses
app.get("/api/addresses", verifyToken, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { 
        userId: req.userId,
        type: { in: ['HOME', 'WORK', 'OTHER'] }
      },
      orderBy: { id: 'desc' }, // Get recent first
      take: 10
    });

    // Deduplicate by line1 + city + postalCode
    const uniqueAddresses = [];
    const seen = new Set();

    for (const addr of addresses) {
      const key = `${addr.line1}-${addr.city}-${addr.postalCode}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAddresses.push(addr);
      }
    }

    res.json({ success: true, addresses: uniqueAddresses });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE Saved Address
app.delete("/api/addresses/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if address belongs to user
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address || address.userId !== req.userId) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }

    await prisma.address.delete({
      where: { id }
    });

    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE Saved Address
app.post("/api/addresses", verifyToken, async (req, res) => {
  try {
    const { line1, line2, city, state, country, postalCode, type, fullName, phone, otherLabel } = req.body;
    
    // Simple validation
    if (!line1 || !city || !postalCode) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newAddress = await prisma.address.create({
      data: {
        line1,
        line2,
        city,
        state,
        country: country || 'India',
        postalCode,
        type: type || 'HOME',
        otherLabel,
        fullName,
        phone,
        userId: req.userId
      }
    });

    res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// ORDER ENDPOINTS
// =====================

// Create order from cart
app.post("/api/orders", verifyToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    // Create address
    const address = await prisma.address.create({
      data: {
        type: 'SHIPPING',
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || null,
        city: shippingAddress.city,
        state: shippingAddress.state || null,
        country: 'India',
        postalCode: shippingAddress.postalCode,
        userId: req.userId
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        method: paymentMethod || 'CASH',
        status: 'SUCCESS',
        amount: total,
        userId: req.userId
      }
    });

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        total,
        status: 'PAID',
        paymentId: payment.id,
        shippingAddressId: address.id,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size
          }))
        }
      },
      include: {
        items: {
          include: { product: true }
        },
        shippingAddress: true
      }
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          imageUrl: item.product.imageUrl
        })),
        shippingAddress: order.shippingAddress
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's orders
app.get("/api/orders", verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true }
            }
          }
        },
        shippingAddress: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          price: item.price,
          quantity: item.quantity,
          size: item.size
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.payment?.method
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single order detail
app.get("/api/orders/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true }
            }
          }
        },
        shippingAddress: true,
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          price: item.price,
          quantity: item.quantity,
          size: item.size
        })),
        shippingAddress: order.shippingAddress,
        payment: order.payment ? {
          method: order.payment.method,
          status: order.payment.status,
          amount: order.payment.amount
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// ADMIN ENDPOINTS
// --------------------

// Get administrative statistics
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, allOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({ select: { total: true } })
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Get order distribution by status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        statusDistribution: statusCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching admin stats" });
  }
});

// List all orders with user and status details
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        items: { include: { product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching admin orders" });
  }
});

// Update order status
app.patch("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
});

// List all products with stock and category info
app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching admin inventory" });
  }
});

// Delete a product (Soft delete or hard delete if no dependencies)
app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing order items
    const linkedItems = await prisma.orderItem.count({ where: { productId: id } });
    
    if (linkedItems > 0) {
      // If linked to orders, we just deactivate it
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      return res.json({ success: true, message: "Product deactivated (linked to existing orders)" });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
});

// Get detailed revenue history (Last 14 days)
app.get("/api/admin/revenue-history", async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        status: { not: 'CANCELED' }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const historyMap = {};
    for (let i = 0; i < 14; i++) {
       const date = new Date();
       date.setDate(date.getDate() - i);
       const dateStr = date.toISOString().split('T')[0];
       historyMap[dateStr] = 0;
    }

    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (historyMap[dateStr] !== undefined) {
        historyMap[dateStr] += parseFloat(order.total);
      }
    });

    const history = Object.entries(historyMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching revenue history" });
  }
});

// Get detailed user list with spend data
app.get("/api/admin/users-detailed", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: { total: true }
        }
      }
    });

    const detailedUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      orderCount: user.orders.length,
      totalSpend: user.orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
      joinedAt: user.createdAt
    }));

    res.json({ success: true, users: detailedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching detailed users" });
  }
});

// Delete a user
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Safety: check for orders
    const orderCount = await prisma.order.count({ where: { userId } });
    if (orderCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete user with existing orders" });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

// Get all users (for development/admin purposes)
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      message: `Found ${users.length} registered users`,
      users: users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// ENHANCED ADMIN ENDPOINTS
// =====================

// Advanced analytics (KPIs + traffic simulation)
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, todayOrders, weekOrders, monthOrders, activeUsersData, allOrders, totalProducts, statusCounts, paymentMethodsData, orderItemsData] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { userId: true },
        distinct: ['userId']
      }),
      prisma.order.findMany({ select: { total: true, createdAt: true } }),
      prisma.product.count(),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.payment.groupBy({ by: ['method'], _count: true, where: { status: 'SUCCESS' } }),
      prisma.orderItem.findMany({ include: { product: true } })
    ]);

    const productSales = {};
    orderItemsData.forEach(item => {
      if (!item.product) return;
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product.name, revenue: 0, sold: 0 };
      }
      productSales[item.productId].revenue += parseFloat(item.price) * item.quantity;
      productSales[item.productId].sold += item.quantity;
    });
    const topProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0, 5);

    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const activeUsers = activeUsersData.length;
    const conversionRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100) : 0;

    // Generate 30-day traffic trend based on STRICTLY REAL data
    const [recentOrdersList, recentUsersList] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { createdAt: true }
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { createdAt: true }
      })
    ]);

    const dataByDate = {};
    recentOrdersList.forEach(o => {
      const d = o.createdAt.toISOString().split('T')[0];
      if (!dataByDate[d]) dataByDate[d] = { orders: 0, newUsers: 0 };
      dataByDate[d].orders++;
    });
    recentUsersList.forEach(u => {
      const d = u.createdAt.toISOString().split('T')[0];
      if (!dataByDate[d]) dataByDate[d] = { orders: 0, newUsers: 0 };
      dataByDate[d].newUsers++;
    });

    const traffic = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const stats = dataByDate[dateStr] || { orders: 0, newUsers: 0 };
      
      // Calculate real estimated visitors based on actual DB events
      // E.g., 1 order ≈ 5 visits, 1 signup ≈ 3 visits, + baseline 1 active visit per total current users mapped to hour
      const totalBaseline = Math.floor(activeUsers * 0.1); // ~10% active daily
      const visitors = Math.round(totalBaseline + (stats.orders * 5) + (stats.newUsers * 3));
      
      traffic.push({ date: dateStr, visitors: Math.max(visitors, 1), orders: stats.orders, newUsers: stats.newUsers });
    }

    res.json({
      success: true,
      analytics: {
        totalRevenue, totalUsers, totalProducts,
        totalOrders: allOrders.length,
        todayOrders, weekOrders, monthOrders,
        activeUsers,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        statusDistribution: statusCounts,
        paymentMethods: paymentMethodsData,
        topProducts,
        traffic
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
});

// Category-wise sales (pie chart)
app.get("/api/admin/analytics/category-sales", async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: { include: { category: true } }
      }
    });

    const categorySales = {};
    orderItems.forEach(item => {
      const catName = item.product.category?.name || 'Uncategorized';
      const subCatName = item.product.subcategory || 'Other';
      
      if (!categorySales[catName]) {
        categorySales[catName] = { category: catName, revenue: 0, orders: 0, subcategories: {} };
      }
      const itemRev = parseFloat(item.price) * item.quantity;
      
      categorySales[catName].revenue += itemRev;
      categorySales[catName].orders += item.quantity;
      
      if (!categorySales[catName].subcategories[subCatName]) {
        categorySales[catName].subcategories[subCatName] = { name: subCatName, revenue: 0, orders: 0 };
      }
      categorySales[catName].subcategories[subCatName].revenue += itemRev;
      categorySales[catName].subcategories[subCatName].orders += item.quantity;
    });

    const data = Object.values(categorySales).map(c => ({
      ...c,
      subcategories: Object.values(c.subcategories).sort((a, b) => b.revenue - a.revenue)
    })).sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Category sales error:', error);
    res.status(500).json({ success: false, message: "Error fetching category sales" });
  }
});

// Monthly revenue (bar chart — 12 months)
app.get("/api/admin/analytics/monthly-revenue", async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({ start, end, label: start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) });
    }

    const results = await Promise.all(
      months.map(async (m) => {
        const orders = await prisma.order.findMany({
          where: { createdAt: { gte: m.start, lte: m.end }, status: { not: 'CANCELED' } },
          select: { total: true }
        });
        return {
          month: m.label,
          revenue: orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
          orders: orders.length
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({ success: false, message: "Error fetching monthly revenue" });
  }
});

// State-wise geo data (India map heatmap)
app.get("/api/admin/analytics/geo", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { shippingAddressId: { not: null } },
      include: { shippingAddress: { select: { state: true, city: true } } }
    });

    const stateData = {};
    orders.forEach(order => {
      const state = order.shippingAddress?.state || 'Unknown';
      if (state === 'Unknown') return;
      if (!stateData[state]) stateData[state] = { state, orders: 0, revenue: 0 };
      stateData[state].orders++;
      stateData[state].revenue += parseFloat(order.total);
    });

    res.json({ success: true, data: Object.values(stateData) });
  } catch (error) {
    console.error('Geo data error:', error);
    res.status(500).json({ success: false, message: "Error fetching geo data" });
  }
});

// Create product
app.post("/api/admin/products", async (req, res) => {
  try {
    const { name, description, price, originalPrice, stock, imageUrl, gallery, subcategory, categoryId, isOnSale } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        gallery: gallery || [],
        subcategory: subcategory || null,
        categoryId: categoryId || null,
        isOnSale: isOnSale || false,
      },
      include: { category: true }
    });
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
});

// Update product
app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, originalPrice, stock, imageUrl, gallery, subcategory, categoryId, isOnSale, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (gallery !== undefined) updateData.gallery = gallery;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isOnSale !== undefined) updateData.isOnSale = isOnSale;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
});

// Bulk product actions
app.patch("/api/admin/products/bulk", async (req, res) => {
  try {
    const { action, productIds, data } = req.body;
    if (action === 'delete') {
      for (const id of productIds) {
        const linked = await prisma.orderItem.count({ where: { productId: id } });
        if (linked > 0) {
          await prisma.product.update({ where: { id }, data: { isActive: false } });
        } else {
          // Clean up related records first
          await prisma.favouriteItems.deleteMany({ where: { productId: id } });
          await prisma.cartItem.deleteMany({ where: { productId: id } });
          await prisma.review.deleteMany({ where: { productId: id } });
          await prisma.product.delete({ where: { id } });
        }
      }
    } else if (action === 'update-stock') {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { stock: parseInt(data.stock) }
      });
    } else if (action === 'toggle-sale') {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isOnSale: data.isOnSale }
      });
    }
    res.json({ success: true, message: `Bulk ${action} completed for ${productIds.length} products` });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, message: "Error performing bulk action" });
  }
});

// All payments/transactions
app.get("/api/admin/payments", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        order: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Payments error:', error);
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
});

// All reviews (admin moderation)
app.get("/api/admin/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        product: { select: { id: true, name: true, imageUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Reviews error:', error);
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
});

// Delete review (admin moderation)
app.delete("/api/admin/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: "Error deleting review" });
  }
});

// Admin Notifications
app.get("/api/admin/notifications", async (req, res) => {
  try {
    const rawOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { user: true } });
    const rawStock = await prisma.product.findMany({ where: { stock: { lte: 5 } }, take: 8 });
    const rawReviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { product: true } });

    let notes = [];
    
    // orders -> notifications
    rawOrders.forEach(o => {
      notes.push({
        id: `ord-${o.id}`,
        type: 'order',
        message: `New order from ${o.user?.fullName || 'Customer'} (₹${o.total})`,
        time: o.createdAt,
        read: false
      });
    });

    // stock -> notifications
    rawStock.forEach(p => {
      notes.push({
        id: `stock-${p.id}`,
        type: 'stock',
        message: `Low stock: ${p.name} (${p.stock} left)`,
        time: p.updatedAt || p.createdAt,
        read: false
      });
    });

    // reviews -> notifications
    rawReviews.forEach(r => {
      notes.push({
        id: `rev-${r.id}`,
        type: 'review',
        message: `${r.rating}★ Review on ${r.product?.name || 'Product'}`,
        time: r.createdAt,
        read: false
      });
    });

    // sort desc by time
    notes.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // optionally format `time` on the client or here. We keep it as Date string for frontend parsing.

    res.json({ success: true, notifications: notes });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
});

// Single order detail (admin)
app.get("/api/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        items: { include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } } },
        shippingAddress: true,
        payment: true
      }
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ success: false, message: "Error fetching order detail" });
  }
});

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      return res.status(503).json({ 
        message: "AI Support is temporarily unavailable (API Key missing). Please contact support@aurastore.com.",
        isConfigError: true
      });
    }

    // Start chat with history
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Provide context in the message if it's the first message or every time for RAG-like behavior
    // For a small file, we can just prepend it or use it as a system instruction (which we already did)
    // We'll add a reminder of the rules in the prompt to ensure it stays grounded
    const prompt = `Context (Company Rules):
${companyRules}

User Query: ${message}`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      success: true, 
      reply: text 
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Failed to process chat. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
