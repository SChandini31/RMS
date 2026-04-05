const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const authMiddleware = require('../middleware/authMiddleware');
const Publication = require('../models/publicationModel');
const User = require('../models/userModel');
const AuditLog = require('../models/auditLogModel');

// Build chart/report data based on role + range
async function getPublicationReportData(req) {
  const range = req.query.range || 'monthly';
  const now = new Date();

  const currentUser = await User.findById(req.user.id);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Role-based scope
  let filter = {};
  if (req.user.role === 'admin') {
    filter.department = currentUser.department;
  } else if (req.user.role === 'faculty' || req.user.role === 'student') {
    filter.uploadedBy = req.user.id;
  } else if (
    req.user.role === 'super_admin' ||
    req.user.role === 'directorate' ||
    req.user.role === 'special_user'
  ) {
    // full access / view access
  } else {
    throw new Error('Access denied');
  }

  let data = [];

  if (range === 'weekly') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const publications = await Publication.find({
      ...filter,
      createdAt: { $gte: start, $lte: now }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    data = days.map((day, idx) => ({
      label: day,
      value: publications.filter((pub) => new Date(pub.createdAt).getDay() === idx).length
    }));
  } else if (range === 'monthly') {
    const year = now.getFullYear();

    const publications = await Publication.find({
      ...filter,
      createdAt: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    data = months.map((month, index) => ({
      label: month,
      value: publications.filter((pub) => new Date(pub.createdAt).getMonth() === index).length
    }));
  } else if (range === 'yearly') {
    const currentYear = now.getFullYear();
    const startYear = currentYear - 4;

    const publications = await Publication.find({
      ...filter,
      createdAt: {
        $gte: new Date(`${startYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
      }
    });

    data = Array.from({ length: 5 }, (_, i) => {
      const year = startYear + i;
      return {
        label: String(year),
        value: publications.filter((pub) => new Date(pub.createdAt).getFullYear() === year).length
      };
    });
  } else {
    throw new Error('Invalid range. Use weekly, monthly, or yearly.');
  }

  return {
    range,
    data,
    role: req.user.role,
    department: currentUser.department,
    currentUser
  };
}

// 1) CHART DATA
router.get('/publications', authMiddleware, async (req, res) => {
  try {
    const result = await getPublicationReportData(req);

    res.json({
      range: result.range,
      data: result.data,
      role: result.role,
      department: result.department
    });
  } catch (error) {
    if (error.message === 'Access denied' || error.message.startsWith('Invalid range')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2) EXCEL EXPORT
router.get('/publications/export/excel', authMiddleware, async (req, res) => {
  try {
    const result = await getPublicationReportData(req);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Publication Report');

    worksheet.columns = [
      { header: 'Label', key: 'label', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];

    result.data.forEach((row) => worksheet.addRow(row));

    // AUDIT LOG
    await AuditLog.create({
      action: 'download_report_excel',
      performedBy: req.user.id,
      role: req.user.role,
      department: result.currentUser?.department || '',
      targetType: 'report',
      details: `Downloaded publication report in Excel for range ${result.range}`
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=publication-report-${result.range}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    if (error.message === 'Access denied' || error.message.startsWith('Invalid range')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('EXCEL EXPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3) PDF EXPORT
router.get('/publications/export/pdf', authMiddleware, async (req, res) => {
  try {
    const result = await getPublicationReportData(req);

    // AUDIT LOG
    await AuditLog.create({
      action: 'download_report_pdf',
      performedBy: req.user.id,
      role: req.user.role,
      department: result.currentUser?.department || '',
      targetType: 'report',
      details: `Downloaded publication report in PDF for range ${result.range}`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=publication-report-${result.range}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('Publication Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Range: ${result.range}`);
    doc.text(`Role: ${result.role}`);
    if (result.role === 'admin') {
      doc.text(`Department: ${result.department}`);
    }
    doc.moveDown();

    result.data.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.label}: ${item.value}`);
    });

    doc.end();
  } catch (error) {
    if (error.message === 'Access denied' || error.message.startsWith('Invalid range')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('PDF EXPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;