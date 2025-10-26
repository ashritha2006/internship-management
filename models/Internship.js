const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  companyName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  semester: { type: String, required: true },
  affidavit: { type: String, required: true },
  department: { type: String, required: true },
  academicYear: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'declined'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Internship', internshipSchema);