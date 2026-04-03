const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // <--- required
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'faculty', 'student', 'admin', 'Finance Department', 'University of Management', 'Director-R&D', 'Assistant Director-Research'] },
  department: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
