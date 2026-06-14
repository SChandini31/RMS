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
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: 'From date and To date are required' });
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (fromDate > toDate) {
      return res.status(400).json({ message: 'From date cannot be greater than To date' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = {
      createdAt: { $gte: fromDate, $lte: toDate }
    };

    if (req.user.role === 'admin') {
      filter.department = currentUser.department;
    } else if (req.user.role === 'faculty' || req.user.role === 'student') {
      filter.uploadedBy = req.user.id;
    }

    const publications = await Publication.find(filter)
      .populate('uploadedBy', 'name')
      .populate('facultyApprovedBy', 'name')
      .populate('directorateApprovedBy', 'name')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Publications');

    worksheet.columns = [
      { header: 'Uploaded Date', key: 'uploadedDate', width: 20 },
      { header: 'Count', key: 'count', width: 10 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Publication Type', key: 'publication_type', width: 20 },
      { header: 'Institution/Organization', key: 'institution_organization', width: 25 },
      { header: 'School', key: 'school', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Authors', key: 'authors', width: 40 },
      { header: 'Authors JSON', key: 'authors_json', width: 60 },
      { header: 'Date Of Publication', key: 'date_of_publication', width: 18 },
      { header: 'Journal Name', key: 'journal_name', width: 25 },
      { header: 'ISSN', key: 'issn', width: 18 },
      { header: 'POI URL', key: 'poi_url', width: 30 },
      { header: 'Volume', key: 'volume', width: 12 },
      { header: 'Issue', key: 'issue', width: 10 },
      { header: 'Abstract', key: 'abstract', width: 60 },
      { header: 'Keywords', key: 'keywords', width: 30 },
      { header: 'DOI', key: 'DOI', width: 25 },
      { header: 'Affiliation', key: 'affiliation', width: 30 },
      { header: 'Upload', key: 'upload', width: 30 },
      { header: 'Public ID', key: 'public_id', width: 25 },
      { header: 'File Name', key: 'fileName', width: 30 },
      { header: 'MIME Type', key: 'mimeType', width: 20 },
      { header: 'Index', key: 'index', width: 20 },
      { header: 'Scopus ID', key: 'scopus_id', width: 20 },
      { header: 'Funding Source', key: 'funding_source', width: 25 },
      { header: 'Additional Notes', key: 'additional_notes', width: 40 },
      { header: 'Uploaded By', key: 'uploadedBy', width: 25 },
      { header: 'Uploaded By ID', key: 'uploadedById', width: 24 },
      { header: 'Faculty Approval Status', key: 'facultyApprovalStatus', width: 18 },
      { header: 'Faculty Approved By', key: 'facultyApprovedBy', width: 25 },
      { header: 'Faculty Approved By ID', key: 'facultyApprovedById', width: 24 },
      { header: 'Faculty Approved At', key: 'facultyApprovedAt', width: 20 },
      { header: 'Faculty Rejection Reason', key: 'facultyRejectionReason', width: 40 },
      { header: 'Directorate Approval Status', key: 'directorateApprovalStatus', width: 18 },
      { header: 'Directorate Approved By', key: 'directorateApprovedBy', width: 25 },
      { header: 'Directorate Approved By ID', key: 'directorateApprovedById', width: 24 },
      { header: 'Directorate Approved At', key: 'directorateApprovedAt', width: 20 },
      { header: 'Directorate Rejection Reason', key: 'directorateRejectionReason', width: 40 },
      { header: 'Final Status', key: 'finalStatus', width: 18 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ];

    publications.forEach((p) => {
      const authors = (p.authors || []).map((a) => `${a.name || ''}${a.author_type ? ` (${a.author_type})` : ''}`).join('; ');
      const keywords = (p.keywords || []).join(', ');
      const affiliation = (p.affiliation || []).join(', ');

      worksheet.addRow({
        uploadedDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
        count: 1,
        title: p.title || '',
        publication_type: p.publication_type || '',
        institution_organization: p.institution_organization || '',
        school: p.school || '',
        department: p.department || '',
        authors,
        authors_json: JSON.stringify(p.authors || []),
        date_of_publication: p.date_of_publication ? new Date(p.date_of_publication).toISOString().split('T')[0] : '',
        journal_name: p.journal_name || '',
        issn: p.issn || '',
        poi_url: p.poi_url || '',
        volume: p.volume || '',
        issue: p.issue || '',
        abstract: p.abstract || '',
        keywords,
        DOI: p.DOI || '',
        affiliation,
        upload: p.upload || '',
        public_id: p.public_id || '',
        fileName: p.fileName || '',
        mimeType: p.mimeType || '',
        index: p.index || '',
        scopus_id: p.scopus_id || '',
        funding_source: p.funding_source || '',
        additional_notes: p.additional_notes || '',
        uploadedBy: p.uploadedBy?.name || '',
        uploadedById: p.uploadedBy?._id || '',
        facultyApprovalStatus: p.facultyApprovalStatus || '',
        facultyApprovedBy: p.facultyApprovedBy?.name || '',
        facultyApprovedById: p.facultyApprovedBy?._id || '',
        facultyApprovedAt: p.facultyApprovedAt ? new Date(p.facultyApprovedAt).toISOString() : '',
        facultyRejectionReason: p.facultyRejectionReason || '',
        directorateApprovalStatus: p.directorateApprovalStatus || '',
        directorateApprovedBy: p.directorateApprovedBy?.name || '',
        directorateApprovedById: p.directorateApprovedBy?._id || '',
        directorateApprovedAt: p.directorateApprovedAt ? new Date(p.directorateApprovedAt).toISOString() : '',
        directorateRejectionReason: p.directorateRejectionReason || '',
        finalStatus: p.finalStatus || '',
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : ''
      });
    });

    await AuditLog.create({
      action: 'download_publications_report_excel',
      performedBy: req.user.id,
      role: req.user.role,
      department: currentUser?.department || '',
      targetType: 'report',
      details: `Downloaded publications Excel report from ${from} to ${to}`
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=publication-report-${from}-to-${to}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('EXCEL EXPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3) PDF EXPORT
router.get('/publications/export/pdf', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: 'From date and To date are required' });
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (fromDate > toDate) {
      return res.status(400).json({ message: 'From date cannot be greater than To date' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = {
      createdAt: { $gte: fromDate, $lte: toDate }
    };
    if (req.user.role === 'admin') {
      filter.department = currentUser.department;
    } else if (req.user.role === 'faculty' || req.user.role === 'student') {
      filter.uploadedBy = req.user.id;
    }

    const publications = await Publication.find(filter)
      .sort({ createdAt: -1 });

    await AuditLog.create({
      action: 'download_publications_report_pdf',
      performedBy: req.user.id,
      role: req.user.role,
      department: currentUser?.department || '',
      targetType: 'report',
      details: `Downloaded publications PDF report from ${from} to ${to}`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=publication-report-${from}-to-${to}.pdf`
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(18).text('Publications Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`From: ${from}`);
    doc.text(`To: ${to}`);
    doc.text(`Role: ${req.user.role}`);
    if (req.user.role === 'admin') {
      doc.text(`Department: ${currentUser.department}`);
    }
    doc.moveDown();

    publications.forEach((p, idx) => {
      const authors = (p.authors || []).map((a) => `${a.name || ''}${a.author_type ? ` (${a.author_type})` : ''}`);
      doc.fontSize(12).text(`${idx + 1}. ${p.title || 'Untitled'}`);
      if (p.date_of_publication) {
        doc.fontSize(10).text(`Date: ${new Date(p.date_of_publication).toLocaleDateString()}`);
      }
      if (authors.length) {
        doc.fontSize(10).text(`Authors: ${authors.join('; ')}`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('PDF EXPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;