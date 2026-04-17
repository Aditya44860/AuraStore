const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const emailjs = require('@emailjs/nodejs');
const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
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
      where: { userId: req.userId },
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
