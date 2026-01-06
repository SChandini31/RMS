const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
  title: String,
  department: String,
  startDate: Date,
  endDate: Date,
  milestones: [{
    name: String,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }]
});

module.exports = mongoose.model('Project', projectSchema);
