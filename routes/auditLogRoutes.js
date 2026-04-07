const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

const AuditLog = require('../models/auditLogModel');
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// helper: build filter query
const buildAuditFilter = (query) => {
  const { school, department, from, to } = query;
  const filter = {};

  if (school && school !== 'all') {
    filter.school = school;
  }

  if (department && department !== 'all') {
    filter.department = department;
  }

  if (from || to) {
    filter.createdAt = {};

    if (from) {
      filter.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
      filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }
  }

  return filter;
};

// 1) GET dynamic filter values
router.get(
  '/filters',
  authMiddleware,
  allowRoles('super_admin', 'directorate'),
  async (req, res) => {
    try {
      const schools = await User.distinct('school');
      const departments = await User.distinct('department');

      res.json({
        schools: schools.filter(Boolean).sort(),
        departments: departments.filter(Boolean).sort(),
      });
    } catch (error) {
      console.error('AUDIT FILTERS ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// 2) GET audit log stats
router.get(
  '/stats',
  authMiddleware,
  allowRoles('super_admin', 'directorate'),
  async (req, res) => {
    try {
      const filter = buildAuditFilter(req.query);

      const totalLogs = await AuditLog.countDocuments(filter);

      const userActions = await AuditLog.countDocuments({
        ...filter,
        targetType: 'user',
      });

      const publicationActions = await AuditLog.countDocuments({
        ...filter,
        targetType: 'publication',
      });

      const reportDownloads = await AuditLog.countDocuments({
        ...filter,
        targetType: 'report',
      });

      res.json({
        totalLogs,
        userActions,
        publicationActions,
        reportDownloads,
      });
    } catch (error) {
      console.error('AUDIT STATS ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// 3) GET all audit logs with filters
router.get(
  '/',
  authMiddleware,
  allowRoles('super_admin', 'directorate'),
  async (req, res) => {
    try {
      const filter = buildAuditFilter(req.query);

      const logs = await AuditLog.find(filter)
        .populate('performedBy', 'name email role department school')
        .sort({ createdAt: -1 });

      res.json(logs);
    } catch (error) {
      console.error('AUDIT LOG ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// 4) EXPORT audit logs to Excel
router.get(
  '/export/excel',
  authMiddleware,
  allowRoles('super_admin', 'directorate'),
  async (req, res) => {
    try {
      const filter = buildAuditFilter(req.query);

      const logs = await AuditLog.find(filter)
        .populate('performedBy', 'name email role department school')
        .sort({ createdAt: -1 });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Audit Logs');

      worksheet.columns = [
        { header: 'Date', key: 'date', width: 22 },
        { header: 'Action', key: 'action', width: 25 },
        { header: 'Performed By', key: 'performedBy', width: 25 },
        { header: 'Role', key: 'role', width: 20 },
        { header: 'School', key: 'school', width: 25 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Target Type', key: 'targetType', width: 20 },
        { header: 'Details', key: 'details', width: 50 },
      ];

      logs.forEach((log) => {
        worksheet.addRow({
          date: log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
          action: log.action || '',
          performedBy: log.performedBy?.name || '',
          role: log.role || '',
          school: log.school || '',
          department: log.department || '',
          targetType: log.targetType || '',
          details: log.details || '',
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=audit-logs.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('AUDIT EXCEL EXPORT ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;