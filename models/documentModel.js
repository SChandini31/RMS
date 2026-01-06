const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  relatedTo: String, // e.g. proposal, project, publication
  title: String,
  fileUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
