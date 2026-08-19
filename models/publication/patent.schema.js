const mongoose = require('mongoose');

const patentSchema = new mongoose.Schema(
  {
    application_date: {
      type: Date,
      required: true
    },

    application_number: {
      type: String,
      required: true,
      trim: true
    },

    patent_type: {
      type: String,
      required: true,
      trim: true
    },

    patent_status: {
      type: String,
      required: true,
      trim: true
    },

    publication_date: {
      type: Date,
      default: null
    },

    granted_date: {
      type: Date,
      default: null
    },

    commercialization: {
      is_commercialized: {
        type: Boolean,
        default: false
      },

      details: {
        type: String,
        trim: true,
        default: ''
      }
    },

    patent_url: {
      type: String,
      trim: true,
      default: ''
    },

    technology_transfer_status: {
      type: String,
      trim: true,
      default: ''
    },

    licensing_status: {
      type: String,
      trim: true,
      default: ''
    },

    revenue_generated: {
      type: Number,
      min: 0,
      default: null
    },

    industrial_adoption: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

module.exports = patentSchema;