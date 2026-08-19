const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    edition: {
      type: String,
      trim: true,
      default: ''
    },

    publisher: {
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

    doi_or_link: {
      type: String,
      trim: true,
      default: ''
    },

    indexed_in: {
      type: [String],
      default: []
    },

    isbn: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false
  }
);

module.exports = bookSchema;