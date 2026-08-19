const mongoose = require('mongoose');

const researchProjectSchema = new mongoose.Schema(
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

    funding_agency: {
      type: String,
      required: true,
      trim: true
    },

    scheme_name: {
      type: String,
      required: true,
      trim: true
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
    },

    outcome: {
      type: [String],
      enum: [
        'Publication',
        'Patent',
        'Product',
        'Technology Transfer'
      ],
      default: []
    },

    student_involvement: {
      type: [String],
      enum: ['UG', 'PG', 'Ph.D.'],
      default: []
    },

    societal_industrial_impact: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

module.exports = researchProjectSchema;