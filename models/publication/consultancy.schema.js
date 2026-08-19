const mongoose = require('mongoose');

const consultancySchema = new mongoose.Schema(
  {
    application_date: {
      type: Date,
      required: true
    },

    project_value: {
      type: Number,
      min: 0,
      default: null
    },

    client_name: {
      type: String,
      required: true,
      trim: true
    },

    consultant_assignment_type: {
      type: String,
      enum: ['Testing', 'Project'],
      required: true
    },

    sanctioned_amount: {
      type: Number,
      min: 0,
      default: null
    },

    sanction_date: {
      type: Date,
      default: null
    },

    duration: {
      type: String,
      trim: true,
      default: ''
    },

    status: {
      type: String,
      enum: ['Applied', 'Ongoing', 'Completed'],
      required: true
    }
  },
  {
    _id: false
  }
);

module.exports = consultancySchema;