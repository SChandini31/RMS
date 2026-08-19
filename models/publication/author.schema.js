const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    position: {
      type: Number,
      required: true,
      min: 1
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    designation: {
      type: String,
      trim: true,
      default: ''
    },

    affiliation: {
      type: String,
      trim: true,
      default: ''
    },

    is_tau_affiliated: {
      type: Boolean,
      default: false
    },

    is_first_author: {
      type: Boolean,
      default: false
    },

    is_corresponding_author: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: false
  }
);

module.exports = authorSchema;