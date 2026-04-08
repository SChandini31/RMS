const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Publication = require('../models/publicationModel');
const User = require('../models/userModel');
const AuditLog = require('../models/auditLogModel');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  next();
});

// CREATE publication with file upload
// super_admin can add, but cannot approve/reject/delete
router.post(
  '/',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student'),
  upload.single('file'),
  async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // authors -> JSON array
      let parsedAuthors = [];
      if (req.body.authors) {
        try {
          parsedAuthors = JSON.parse(req.body.authors);
          if (!Array.isArray(parsedAuthors)) {
            return res.status(400).json({ error: 'Authors must be an array' });
          }
        } catch (err) {
          return res.status(400).json({ error: 'Invalid authors format' });
        }
      }

      // keywords -> comma separated string to array
      let parsedKeywords = [];
      if (req.body.keywords && typeof req.body.keywords === 'string') {
        parsedKeywords = req.body.keywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k);
      }

      // affiliation -> comma separated string to array
      let parsedAffiliation = [];
      if (req.body.affiliation && typeof req.body.affiliation === 'string') {
        parsedAffiliation = req.body.affiliation
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a);
      }

      // issue -> number only if provided
      let parsedIssue;
      if (
        req.body.issue !== undefined &&
        req.body.issue !== null &&
        req.body.issue !== ''
      ) {
        parsedIssue = Number(req.body.issue);
        if (Number.isNaN(parsedIssue)) {
          return res.status(400).json({ error: 'Issue must be a number' });
        }
      }


      const normalizeSchool = (value = "") => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bOf\b/g, "of")
    .replace(/\bAnd\b/g, "and");
};

const normalizedSchool = normalizeSchool(req.body.school || "");

const normalizedDepartment = (req.body.department || "").trim().toUpperCase();

if (!normalizedDepartment) {
  return res.status(400).json({ message: "Department is required" });
}

const publicationData = {
  ...req.body,
  school: normalizedSchool,
  department: normalizedDepartment,
  authors: parsedAuthors,
  keywords: parsedKeywords,
  affiliation: parsedAffiliation,
  issue: parsedIssue,
  upload: req.file?.path || "",
  public_id: req.file?.filename || "",
  fileName: req.file?.originalname || "",
  mimeType: req.file?.mimetype || "",
  uploadedBy: req.user?.id || null,

  facultyApprovalStatus: "pending",
  facultyApprovedBy: null,
  facultyApprovedAt: null,
  facultyRejectionReason: "",

  directorateApprovalStatus: "pending",
  directorateApprovedBy: null,
  directorateApprovedAt: null,
  directorateRejectionReason: "",

  finalStatus: "pending",
};

      console.log('REQ BODY:', req.body);
      console.log('PARSED PUBLICATION DATA:', publicationData);
      console.log('REQ FILE:', req.file);

      const publication = await Publication.create(publicationData);

      await AuditLog.create({
        action: 'upload_publication',
        performedBy: req.user.id,
        role: req.user.role,
        department: currentUser?.department || '',
        school: currentUser?.school || '',
        targetType: 'publication',
        targetId: publication._id,
        details: `Uploaded publication "${publication.title}"`
      });

      res.status(201).json({
        message: '✅ Publication saved successfully!',
        data: publication
      });
    } catch (error) {
      console.error('CREATE PUBLICATION ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET all publications with backend role-based filtering
router.get(
  '/',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student', 'admin', 'special_user', 'directorate'),
  async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      let filter = {};

      if (req.user.role === 'student') {
        // student -> only own publications
        filter.uploadedBy = req.user.id;
        filter.department = currentUser.department;
      } else if (req.user.role === 'admin') {
        // admin -> department-wise publications
        filter.department = currentUser.department;
      }
      // super_admin, directorate, faculty, special_user -> all

      const publications = await Publication.find(filter)
        .populate('uploadedBy', 'name email role department school')
        .populate('facultyApprovedBy', 'name email role department school')
        .populate('directorateApprovedBy', 'name email role department school')
        .sort({ createdAt: -1 });

      res.json(publications);
    } catch (error) {
      console.error('GET PUBLICATIONS ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET single publication by ID with access control
router.get(
  '/:id',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student', 'admin', 'special_user', 'directorate'),
  async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const publication = await Publication.findById(req.params.id)
        .populate('uploadedBy', 'name email role department school')
        .populate('facultyApprovedBy', 'name email role department school')
        .populate('directorateApprovedBy', 'name email role department school');

      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }

      if (req.user.role === 'student') {
        if (String(publication.uploadedBy?._id || publication.uploadedBy) !== String(req.user.id)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      if (req.user.role === 'admin') {
        if (publication.department !== currentUser.department) {
          return res.status(403).json({ message: 'Access denied for this department' });
        }
      }

      // super_admin, directorate, special_user -> allowed for all

      res.json(publication);
    } catch (error) {
      console.error('GET SINGLE PUBLICATION ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE publication disabled in current workflow
router.put(
  '/:id',
  authMiddleware,
  async (req, res) => {
    return res.status(403).json({
      message: 'Publication update is disabled in the current workflow'
    });
  }
);

// MULTI-LEVEL APPROVE / REJECT publication
router.put(
  '/:id/status',
  authMiddleware,
  allowRoles('faculty', 'directorate'),
  async (req, res) => {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const publication = await Publication.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);

      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }

      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // once final decision is made, stop further actions
      if (publication.finalStatus !== 'pending') {
        return res.status(400).json({
          message: `Publication is already ${publication.finalStatus}`
        });
      }

      // FACULTY LEVEL
      if (req.user.role === 'faculty') {
  if (publication.facultyApprovalStatus !== 'pending') {
    return res.status(400).json({
      message: `Faculty approval already ${publication.facultyApprovalStatus}`
    });
  }

  if (status === 'approved') {
    publication.facultyApprovalStatus = 'approved';
    publication.facultyApprovedBy = req.user.id;
    publication.facultyApprovedAt = new Date();
    publication.facultyRejectionReason = '';
    publication.finalStatus = 'pending';
  } else {
    publication.facultyApprovalStatus = 'rejected';
    publication.facultyApprovedBy = req.user.id;
    publication.facultyApprovedAt = new Date();
    publication.facultyRejectionReason = rejectionReason || '';
    publication.finalStatus = 'rejected';
  }

  await publication.save();

  await AuditLog.create({
    action: status === 'approved'
      ? 'faculty_approve_publication'
      : 'faculty_reject_publication',
    performedBy: req.user.id,
    role: req.user.role,
    department: currentUser?.department || '',
    school: currentUser?.school || '',
    targetType: 'publication',
    targetId: publication._id,
    details:
      status === 'approved'
        ? `Faculty approved publication "${publication.title}"`
        : `Faculty rejected publication "${publication.title}"${rejectionReason ? ` - Reason: ${rejectionReason}` : ''}`
  });

  return res.json({
    message: `✅ Faculty ${status} publication successfully!`,
    data: publication
  });
}

      // DIRECTORATE LEVEL
      if (req.user.role === 'directorate') {
        if (publication.facultyApprovalStatus !== 'approved') {
          return res.status(400).json({
            message: 'Directorate can act only after faculty approval'
          });
        }

        if (publication.directorateApprovalStatus !== 'pending') {
          return res.status(400).json({
            message: `Directorate approval already ${publication.directorateApprovalStatus}`
          });
        }

        if (status === 'approved') {
          publication.directorateApprovalStatus = 'approved';
          publication.directorateApprovedBy = req.user.id;
          publication.directorateApprovedAt = new Date();
          publication.directorateRejectionReason = '';
          publication.finalStatus = 'approved';
        } else {
          publication.directorateApprovalStatus = 'rejected';
          publication.directorateApprovedBy = req.user.id;
          publication.directorateApprovedAt = new Date();
          publication.directorateRejectionReason = rejectionReason || '';
          publication.finalStatus = 'rejected';
        }

        await publication.save();

        await AuditLog.create({
          action: status === 'approved'
            ? 'directorate_approve_publication'
            : 'directorate_reject_publication',
          performedBy: req.user.id,
          role: req.user.role,
          department: currentUser?.department || '',
          school: currentUser?.school || '',
          targetType: 'publication',
          targetId: publication._id,
          details:
            status === 'approved'
              ? `Directorate approved publication "${publication.title}"`
              : `Directorate rejected publication "${publication.title}"${rejectionReason ? ` - Reason: ${rejectionReason}` : ''}`
        });

        return res.json({
          message: `✅ Directorate ${status} publication successfully!`,
          data: publication
        });
      }

      return res.status(403).json({ message: 'Access denied' });
    } catch (error) {
      console.error('STATUS UPDATE ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE publication disabled in current workflow
router.delete(
  '/:id',
  authMiddleware,
  async (req, res) => {
    return res.status(403).json({
      message: 'Publication delete is disabled in the current workflow'
    });
  }
);

module.exports = router;