const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'super_admin',
      'faculty',
      'student',
      'admin',
      'special_user',
      'directorate'],
    required: true
  },
  department: { type: String, required: true, trim: true },
  school: { type: String, required: true, trim: true },
  contact_number: { type: Number, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
