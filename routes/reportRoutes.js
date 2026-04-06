const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const authMiddleware = require('../middleware/authMiddleware');
const Publication = require('../models/publicationModel');
const User = require('../models/userModel');
const AuditLog = require('../models/auditLogModel');

// Build chart/report data based on role + custom date range
async function getPublicationReportData(req) {
  const { from, to } = req.query;

  if (!from || !to) {
    throw new Error('From date and To date are required');
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new Error('Invalid date format');
  }

  if (fromDate > toDate) {
    throw new Error('From date cannot be greater than To date');
  }

  const currentUser = await User.findById(req.user.id);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Role-based scope
  let filter = {
    createdAt: { $gte: fromDate, $lte: toDate }
  };

  if (req.user.role === 'admin') {
    filter.department = currentUser.department;
  } else if (req.user.role === 'faculty' || req.user.role === 'student') {
    filter.uploadedBy = req.user.id;
  } else if (
    req.user.role === 'super_admin' ||
    req.user.role === 'directorate' ||
    req.user.role === 'special_user'
  ) {
    // full / view-only access
  } else {
    throw new Error('Access denied');
  }

  const publications = await Publication.find(filter).sort({ createdAt: 1 });

  // Group by day for date-range graph
  const groupedData = {};

  publications.forEach((pub) => {
    const dateKey = new Date(pub.createdAt).toISOString().split('T')[0];
    groupedData[dateKey] = (groupedData[dateKey] || 0) + 1;
  });

  const data = Object.keys(groupedData).map((date) => ({
    label: date,
    value: groupedData[date]
  }));

  return {
    from,
    to,
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
      from: result.from,
      to: result.to,
      data: result.data,
      role: result.role,
      department: result.department
    });
  } catch (error) {
    if (
      error.message === 'Access denied' ||
      error.message === 'From date and To date are required' ||
      error.message === 'Invalid date format' ||
      error.message === 'From date cannot be greater than To date'
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error('REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2) EXCEL EXPORT
router.get('/publications/export/excel', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admin can download reports' });
  }
  try {
    const result = await getPublicationReportData(req);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Publication Report');

    worksheet.columns = [
      { header: 'Date', key: 'label', width: 20 },
      { header: 'Publications Count', key: 'value', width: 20 }
    ];

    result.data.forEach((row) => worksheet.addRow(row));

    // AUDIT LOG
    await AuditLog.create({
      action: 'download_report_excel',
      performedBy: req.user.id,
      role: req.user.role,
      department: result.currentUser?.department || '',
      targetType: 'report',
      details: `Downloaded publication report in Excel from ${result.from} to ${result.to}`
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=publication-report-${result.from}-to-${result.to}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    if (
      error.message === 'Access denied' ||
      error.message === 'From date and To date are required' ||
      error.message === 'Invalid date format' ||
      error.message === 'From date cannot be greater than To date'
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error('EXCEL EXPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3) PDF EXPORT
router.get('/publications/export/pdf', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admin can download reports' });
  }
  try {
    const result = await getPublicationReportData(req);

    // AUDIT LOG
    await AuditLog.create({
      action: 'download_report_pdf',
      performedBy: req.user.id,
      role: req.user.role,
      department: result.currentUser?.department || '',
      targetType: 'report',
      details: `Downloaded publication report in PDF from ${result.from} to ${result.to}`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=publication-report-${result.from}-to-${result.to}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('Publication Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`From: ${result.from}`);
    doc.text(`To: ${result.to}`);
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
    if (
      error.message === 'Access denied' ||
      error.message === 'From date and To date are required' ||
      error.message === 'Invalid date format' ||
      error.message === 'From date cannot be greater than To date'
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error('PDF EXPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;