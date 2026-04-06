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
router.post(
  '/',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student'),
  upload.single('file'),
  async (req, res) => {
    try {
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
      if (req.body.issue !== undefined && req.body.issue !== null && req.body.issue !== '') {
        parsedIssue = Number(req.body.issue);
        if (Number.isNaN(parsedIssue)) {
          return res.status(400).json({ error: 'Issue must be a number' });
        }
      }

      const publicationData = {
        ...req.body,
        authors: parsedAuthors,
        keywords: parsedKeywords,
        affiliation: parsedAffiliation,
        issue: parsedIssue,
        upload: req.file?.path || '',
        public_id: req.file?.filename || '',
        fileName: req.file?.originalname || '',
        mimeType: req.file?.mimetype || '',
        uploadedBy: req.user?.id || null
      };

      console.log('REQ BODY:', req.body);
      console.log('PARSED PUBLICATION DATA:', publicationData);
      console.log('REQ FILE:', req.file);

      const publication = await Publication.create(publicationData);

      // AUDIT LOG
      const currentUser = await User.findById(req.user.id);

      await AuditLog.create({
        action: 'upload_publication',
        performedBy: req.user.id,
        role: req.user.role,
        department: currentUser?.department || '',
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

// GET all publications
router.get(
  '/',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student', 'admin', 'special_user', 'directorate'),
  async (req, res) => {
    try {
      const publications = await Publication.find()
        .populate('uploadedBy', 'name email role department')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });

      res.json(publications);
    } catch (error) {
      console.error('GET PUBLICATIONS ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET single publication by ID
router.get(
  '/:id',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student', 'admin', 'special_user', 'directorate'),
  async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const publication = await Publication.findById(req.params.id)
        .populate('uploadedBy', 'name email role department')
        .populate('approvedBy', 'name email role');

      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }

      res.json(publication);
    } catch (error) {
      console.error('GET SINGLE PUBLICATION ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE publication by ID -> only super_admin
router.put(
  '/:id',
  authMiddleware,
  allowRoles('super_admin'),
  async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const existingPublication = await Publication.findById(req.params.id);

      if (!existingPublication) {
        return res.status(404).json({ message: '❌ Publication not found!' });
      }

      const updatedPublication = await Publication.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      // AUDIT LOG
      const currentUser = await User.findById(req.user.id);
      await AuditLog.create({
        action: 'update_publication',
        performedBy: req.user.id,
        role: req.user.role,
        department: currentUser?.department || '',
        targetType: 'publication',
        targetId: updatedPublication._id,
        details: `Updated publication "${updatedPublication.title}"`
      });

      res.json({
        message: '✅ Publication updated successfully!',
        data: updatedPublication
      });
    } catch (error) {
      console.error('UPDATE PUBLICATION ERROR:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// APPROVE / REJECT publication
router.put(
  '/:id/status',
  authMiddleware,
  allowRoles('super_admin', 'directorate'),
  async (req, res) => {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const publication = await Publication.findById(req.params.id);

      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }

      publication.status = status;
      publication.approvedBy = req.user?.id || null;
      publication.approvedAt = new Date();
      publication.rejectionReason =
        status === 'rejected' ? (rejectionReason || '') : '';

      await publication.save();

      // AUDIT LOG
      const currentUser = await User.findById(req.user.id);
      await AuditLog.create({
        action: status === 'approved' ? 'approve_publication' : 'reject_publication',
        performedBy: req.user.id,
        role: req.user.role,
        department: currentUser?.department || '',
        targetType: 'publication',
        targetId: publication._id,
        details:
          status === 'approved'
            ? `Approved publication "${publication.title}"`
            : `Rejected publication "${publication.title}"${rejectionReason ? ` - Reason: ${rejectionReason}` : ''}`
      });

      res.json({
        message: `✅ Publication ${status} successfully!`,
        data: publication
      });
    } catch (error) {
      console.error('STATUS UPDATE ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE publication by ID -> only super_admin
router.delete(
  '/:id',
  authMiddleware,
  allowRoles('super_admin'),
  async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const deletedPublication = await Publication.findByIdAndDelete(req.params.id);

      if (!deletedPublication) {
        return res.status(404).json({ message: '❌ Publication not found!' });
      }

      // AUDIT LOG
      const currentUser = await User.findById(req.user.id);
      await AuditLog.create({
        action: 'delete_publication',
        performedBy: req.user.id,
        role: req.user.role,
        department: currentUser?.department || '',
        targetType: 'publication',
        targetId: deletedPublication._id,
        details: `Deleted publication "${deletedPublication.title}"`
      });

      res.json({ message: '🗑️ Publication deleted successfully!' });
    } catch (error) {
      console.error('DELETE PUBLICATION ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;