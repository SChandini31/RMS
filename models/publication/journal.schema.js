const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    journal_name: {
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

    issn: {
      type: String,
      required: true,
      trim: true
    },

    impact_factor: {
      type: Number,
      min: 0,
      default: null
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

    quartile: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'NSI'],
      default: null
    },

    citation_count: {
      type: Number,
      min: 0,
      default: 0
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

module.exports = journalSchema;