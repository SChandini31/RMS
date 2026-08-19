const mongoose = require('mongoose');

const bookChapterSchema = new mongoose.Schema(
  {
    chapter_title: {
      type: String,
      required: true,
      trim: true
    },

    book_title: {
      type: String,
      required: true,
      trim: true
    },

    editor: {
      type: String,
      required: true,
      trim: true
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

    issn: {
      type: String,
      required: true,
      trim: true
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

module.exports = bookChapterSchema;