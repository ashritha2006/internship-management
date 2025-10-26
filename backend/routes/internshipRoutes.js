const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { authenticateToken } = require('./authRoutes');

// Add internship (Student only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can add internships' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const internshipData = {
      ...req.body,
      student: req.user.userId,
      studentName: user.name,
      rollNumber: user.rollNumber,
      department: user.department,
      email: user.email,
      academicYear: user.academicYear
    };

    const internship = new Internship(internshipData);
    await internship.save();
    
    const populatedInternship = await Internship.findById(internship._id).populate('student', 'name rollNumber email department');
    res.status(201).json(populatedInternship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get internships (Student gets their own, Admin gets all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let internships;
    
    if (req.user.role === 'admin') {
      internships = await Internship.find().populate('student', 'name rollNumber email department academicYear');
    } else {
      internships = await Internship.find({ student: req.user.userId }).populate('student', 'name rollNumber email department academicYear');
    }
    
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get internships by academic year (Student only)
router.get('/year/:academicYear', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    const internships = await Internship.find({ 
      student: req.user.userId,
      academicYear: req.params.academicYear 
    }).populate('student', 'name rollNumber email department academicYear');
    
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get approved internships count by academic year (Student only)
router.get('/count/:academicYear', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    const count = await Internship.countDocuments({ 
      student: req.user.userId,
      academicYear: req.params.academicYear,
      status: 'approved'
    });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update internship (Student can update their own, Admin can update any)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && internship.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own internships' });
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name rollNumber email department academicYear');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Approve/Decline internship (Admin only)
router.put('/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can approve internships' });
    }

    const { status } = req.body;
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or declined' });
    }

    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: req.user.userId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name rollNumber email department academicYear');

    if (!updated) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete internship (Student can delete their own, Admin can delete any)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && internship.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own internships' });
    }

    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export to Excel (filtered by IDs) - Admin only
router.get('/export', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can export data' });
    }

    const ids = req.query.ids ? req.query.ids.split(',') : null;
    const records = ids ? 
      await Internship.find({ _id: { $in: ids } }).populate('student', 'name rollNumber email department academicYear') : 
      await Internship.find().populate('student', 'name rollNumber email department academicYear');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Internships');

    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Company', key: 'companyName', width: 20 },
      { header: 'Location', key: 'location', width: 15 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Duration', key: 'duration', width: 15 },
      { header: 'Stipend', key: 'stipend', width: 10 },
      { header: 'Mentor Name', key: 'mentorName', width: 20 },
      { header: 'Mentor Contact', key: 'mentorContact', width: 15 },
      { header: 'Semester', key: 'semester', width: 15 },
      { header: 'Affidavit', key: 'affidavit', width: 15 },
      { header: 'Academic Year', key: 'academicYear', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    records.forEach(record => {
      worksheet.addRow({
        ...record._doc,
        startDate: new Date(record.startDate).toLocaleDateString(),
        endDate: new Date(record.endDate).toLocaleDateString(),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=internships.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating Excel');
  }
});

module.exports = router;
