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
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category
app.get("/api/products/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      where: {
        isActive: true,
        category: {
          name: {
            equals: categoryName,
            mode: 'insensitive'
          }
        }
      }
    });
    
    res.json({
      success: true,
      products: products
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
    const { category } = req.query;
    
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
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product by ID
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
    
    res.json({
      success: true,
      product: product
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
