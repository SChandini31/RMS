const mongoose = require('mongoose');

const publicationTypes = require('../config/publicationTypes');
const authorSchema = require('./publication/author.schema');

const publicationTypeValues = publicationTypes.map(
  (type) => type.value
);

const publicationSchema = new mongoose.Schema(
  {
    // =========================================================
    // COMMON INFORMATION
    // =========================================================

    institution_organization: {
      type: String,
      trim: true
    },

    school: {
      type: String,
      trim: true
    },

    department: {
      type: String,
      trim: true
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // =========================================================
    // PUBLICATION TYPE
    // =========================================================

    publication_type: {
      type: String,
      required: true,
      enum: publicationTypeValues
    },

    // =========================================================
    // COMMON TITLE
    // =========================================================

    title: {
      type: String,
      required: true,
      trim: true
    },

    // =========================================================
    // AUTHORS
    // =========================================================

    authors: {
      type: [authorSchema],
      default: []
    },

    // =========================================================
    // TYPE-SPECIFIC DATA
    // =========================================================
    //
    // The actual structure of this field is validated
    // according to publication_type in publicationValidator.js
    //
    // journal          -> journalSchema
    // book             -> bookSchema
    // book_chapter     -> bookChapterSchema
    // conference       -> conferenceSchema
    // patent           -> patentSchema
    // research_project -> researchProjectSchema
    // consultancy      -> consultancySchema
    // research_collaboration -> researchCollaborationSchema
    // research_support -> researchSupportSchema
    //
    // =========================================================

    type_details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // =========================================================
    // COMMON OPTIONAL INFORMATION
    // =========================================================

    abstract: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true;

          const wordCount = value
            .trim()
            .split(/\s+/)
            .length;

          return wordCount <= 350;
        },
        message: 'Abstract must not exceed 350 words'
      }
    },

    keywords: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          if (!value || value.length === 0) return true;

          const combinedLength = value.join(', ').length;

          return combinedLength <= 150;
        },
        message: 'Keywords must not exceed 150 characters'
      }
    },

    // =========================================================
    // FILE INFORMATION
    // =========================================================

    upload: {
      type: String,
      trim: true,
      default: ''
    },

    public_id: {
      type: String,
      trim: true,
      default: ''
    },

    fileName: {
      type: String,
      trim: true,
      default: ''
    },

    mimeType: {
      type: String,
      trim: true,
      default: ''
    },

    // =========================================================
    // ADDITIONAL INFORMATION
    // =========================================================

    additional_notes: {
      type: String,
      trim: true,
      default: ''
    },

    // =========================================================
    // CREATED / UPLOADED BY
    // =========================================================

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // =========================================================
    // FACULTY APPROVAL
    // =========================================================

    facultyApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    facultyApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    facultyApprovedAt: {
      type: Date,
      default: null
    },

    facultyRejectionReason: {
      type: String,
      default: ''
    },

    // =========================================================
    // DIRECTORATE APPROVAL
    // =========================================================

    directorateApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    directorateApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    directorateApprovedAt: {
      type: Date,
      default: null
    },

    directorateRejectionReason: {
      type: String,
      default: ''
    },

    // =========================================================
    // FINAL STATUS
    // =========================================================

    finalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'Publication',
  publicationSchema
);