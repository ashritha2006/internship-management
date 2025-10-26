const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const auth = require('../middleware/auth');

// Add internship
router.post('/', auth, async (req, res) => {
    try {
        const internship = new Internship({
            ...req.body,
            studentId: req.user.id,
            academicYear: new Date(req.body.startDate).getFullYear().toString()
        });
        await internship.save();
        res.status(201).json(internship);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student internships
router.get('/student', auth, async (req, res) => {
    try {
        const internships = await Internship.find({ studentId: req.user.id });
        res.json(internships);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all internships (admin)
router.get('/admin', auth, async (req, res) => {
    try {
        const internships = await Internship.find().populate('studentId');
        res.json(internships);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update internship status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const internship = await Internship.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(internship);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;