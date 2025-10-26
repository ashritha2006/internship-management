const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // ... existing code ...
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add new fields
  semester: { type: String, required: true },
  affidavit: { type: String, required: true, enum: ['yes', 'no'] },
  // ... existing code ...
});

// ... rest of the code ...