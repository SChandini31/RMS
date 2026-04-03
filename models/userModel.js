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
      'finance_department',
      'university_management',
      'director_rd',
      'assistant_director_research'
    ],
    required: true
  },
  department: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
