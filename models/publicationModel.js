const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  institution_organization: String,
  school: String,
  department: String,
  publication_type: String, // e.g. journal, chapter book, books, conference, others
  title: String,
  authors: [
    {
      name: String,
      author_type: String // e.g. first author, second author, co-author
    }
  ],
  date_of_publication: Date,
  journal_name: String,
  issn: Number,
  poi_url: String,
  volume: String,
  issue: Number,
  abstract: String, // 250-350 words
  keywords: [String],
  upload: String,
  index: String,
  scopus_id: Number,
  funding_source: String,
  additional_notes: String
} , { timestamps: true });

module.exports = mongoose.model('Publication', publicationSchema);
