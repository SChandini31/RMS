const express = require('express');
const router = express.Router();

const AuditLog = require('../models/auditLogModel');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// GET all audit logs -> only super_admin
router.get('/', authMiddleware, allowRoles('super_admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role department')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error('AUDIT LOG ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;