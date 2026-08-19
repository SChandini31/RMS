const mongoose = require('mongoose');

const researchSupportSchema = new mongoose.Schema(
  {
    support_type: {
      type: String,
      enum: [
        'Seed Grant',
        'APC',
        'Travel Grant',
        'FDP',
        'Workshop'
      ],
      required: true
    },

    support_provided_by: {
      type: String,
      enum: [
        'University',
        'External Agency'
      ],
      required: true
    },

    year: {
      type: Number,
      required: true,
      min: 1900,
      max: 2100
    },

    outcome_impact: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

module.exports = researchSupportSchema;