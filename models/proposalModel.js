// const mongoose = require('mongoose');

// const proposalSchema = new mongoose.Schema({
//   title: String,
//   submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   department: String,
//   description: String,
//   status: { type: String, enum: ['submitted', 'review', 'approved', 'rejected'], default: 'submitted' },
//   submittedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Proposal', proposalSchema);

const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    department: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    status: {
      type: String,
      enum: ['submitted', 'review', 'approved', 'rejected'],
      default: 'submitted'
    },

    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
