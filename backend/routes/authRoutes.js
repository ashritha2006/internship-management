const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Student Registration
router.post('/register', async (req, res) => {
  try {
    const { name, rollNumber, email, department, password, academicYear } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Create new user
    const user = new User({
      name,
      rollNumber,
      email,
      department,
      password,
      academicYear,
      role: 'student'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        department: user.department,
        academicYear: user.academicYear,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        department: user.department,
        academicYear: user.academicYear,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Login (hardcoded credentials)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check hardcoded admin credentials
    if (email === 'admin@college.edu' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: 'admin',
          name: 'Admin',
          email: 'admin@college.edu',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.userId === 'admin') {
      return res.json({
        id: 'admin',
        name: 'Admin',
        email: 'admin@college.edu',
        role: 'admin'
      });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, authenticateToken };
