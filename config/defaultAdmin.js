const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@college.edu' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        email: 'admin@admin.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('Default admin created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

module.exports = createDefaultAdmin;