const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema(
  {
    institution_organization: String,
    school: String,
    department: String,

    publication_type: String, // journal, chapter book, books, conference, others
    title: String,

    authors: [
      {
        name: String,
        author_type: String // first author, second author, co-author
      }
    ],

    date_of_publication: Date,
    journal_name: String,

    // ISSN stored as alphanumeric
    issn: {
      type: String
    },

    poi_url: String,
    volume: String,
    issue: Number,

    // Abstract limited to max 350 words
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

    // Keywords limited to 150 characters (total)
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

    upload: String,
    index: String,

    // OPTIONAL fields
    scopus_id: {
      type: String,
      required: false
    },

    funding_source: {
      type: String,
      required: false
    },

    additional_notes: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Publication', publicationSchema);
