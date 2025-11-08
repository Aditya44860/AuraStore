const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
        name,
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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Subscribe endpoint
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to AuraStore!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to AuraStore!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter!</p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">You'll now receive:</p>
            <ul style="color: #666; font-size: 16px; line-height: 1.6;">
              <li>Early access to new collections</li>
              <li>Exclusive offers and discounts</li>
              <li>Fashion trends and style tips</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://theaurastore.vercel.app/" style="background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">Welcome to the AuraStore family!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Subscription successful" });
  } catch (error) {
    res.status(500).json({ message: "Subscription failed", error: error.message });
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
