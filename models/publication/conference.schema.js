const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema(
  {
    conference_name: {
      type: String,
      required: true,
      trim: true
    },

    publication_date: {
      type: Date,
      required: true
    },

    scope: {
      type: String,
      enum: ['National', 'International'],
      required: true
    },

    organizer_society: {
      type: String,
      required: true,
      trim: true
    },

    conference_city: {
      type: String,
      required: true,
      trim: true
    },

    conference_country: {
      type: String,
      required: true,
      trim: true
    },

    conference_date: {
      type: Date,
      required: true
    },

    volume: {
      type: String,
      trim: true,
      default: ''
    },

    issue: {
      type: String,
      trim: true,
      default: ''
    },

    starting_page: {
      type: Number,
      min: 1,
      default: null
    },

    ending_page: {
      type: Number,
      min: 1,
      default: null
    },

    indexed_in: {
      type: [String],
      default: []
    },

    doi_or_link: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

module.exports = conferenceSchema;