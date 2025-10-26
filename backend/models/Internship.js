const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: String,
  rollNumber: String,
  department: String,
  email: String,
  companyName: String,
  location: String,
  startDate: Date,
  endDate: Date,
  duration: String,
  stipend: String,
  mentorName: String,
  mentorContact: String,
  semester: {
    type: String,
    required: true
  },
  affidavit: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
