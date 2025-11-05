const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// Database connection using Prisma

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  console.log('Register endpoint hit');
  try {
    const { name, email, password } = req.body;
    console.log('Registration data:', { name, email });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        fullName: name,
      },
    });
    console.log('User created:', user.id);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log('Token generated:', token);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log('Login token generated:', token);

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
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

    res.json({ user: { id: user.id, name: user.name, email: user.email, fullName: user.fullName, phone: user.phone, createdAt: user.createdAt } });
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
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, fullName: updatedUser.fullName, phone: updatedUser.phone }
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
