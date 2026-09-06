const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: [String],
    enum: [
      'super_admin',
      'faculty',
      'student',
      'admin',
      'special_user',
      'directorate'
    ],
    required: true,
    validate: {
      validator: function (roles) {
        return roles && roles.length > 0;
      },
      message: 'User must have at least one role'
    }
  },

  department: {
    type: String,
    required: true,
    trim: true
  },

  school: {
    type: String,
    required: true,
    trim: true
  },

  contact_number: {
    type: Number
  },

  organization_institution: {
    type: String,
    required: true,
    trim: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);