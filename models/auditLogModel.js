const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // create_user, delete_user, upload_publication...
    
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    role: { type: String, required: true },

    department: { type: String, default: '' },

    // ✅ ADD THIS FIELD
    school: { type: String, default: '' },

    targetType: { type: String, required: true }, // user, publication, report
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },

    details: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);