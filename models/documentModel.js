const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  relatedTo: { type: String, required: true, trim: true }, // e.g. proposal, project, publication
  title: { type: String, required: true, trim: true },
  fileUrl:{ type: String, required: true },
  fileName: { type: String, required: true, trim: true },
  MimeType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
