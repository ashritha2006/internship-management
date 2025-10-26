const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Student Register
router.post('/student/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const student = new Student({
            ...req.body,
            password: hashedPassword
        });
        await student.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Login
router.post('/student/login', async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.body.email });
        if (!student) return res.status(400).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(req.body.password, student.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
        res.json({ token, student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@admin.com' && password === 'admin123') {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;