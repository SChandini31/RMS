const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema(
  {
    institution_organization: { type: String, trim: true },
    school: { type: String, trim: true },
    department: { type: String, trim: true },

    publication_type: { type: String, trim: true }, // journal, chapter book, books, conference, others
    title: { type: String, required: true, trim: true },

    authors: [
      {
        name: { type: String, trim: true },
        author_type: { type: String, trim: true } // first author, second author, co-author
      }
    ],

    date_of_publication: Date,
    journal_name: { type: String, trim: true },

    issn: {
      type: String,
      trim: true
    },

    poi_url: { type: String, trim: true },
    volume: { type: String, trim: true },
    issue: Number,

    abstract: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 350;
        },
        message: 'Abstract must not exceed 350 words'
      }
    },

    keywords: {
      type: [String],
      validate: {
        validator: function (value) {
          if (!value) return true;
          const combinedLength = value.join(', ').length;
          return combinedLength <= 150;
        },
        message: 'Keywords must not exceed 150 characters'
      }
    },

    DOI: { type: String, trim: true },
    affiliation: [{ type: String, trim: true }],

    // uploaded file path/url
    upload: { type: String, trim: true },
    public_id: { type: String, trim: true },
    fileName: { type: String, trim: true },
    mimeType: { type: String, trim: true },

    index: { type: String, trim: true },

    scopus_id: {
      type: String,
      required: false,
      trim: true
    },

    funding_source: {
      type: String,
      required: false,
      trim: true
    },

    additional_notes: {
      type: String,
      required: false,
      trim: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    approvedAt: {
      type: Date,
      default: null
    },

    rejectionReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Publication', publicationSchema);