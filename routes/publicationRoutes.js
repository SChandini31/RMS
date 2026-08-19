const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  updatePublicationStatus,
  deletePublication,
  getPublicationTypes
} = require('../controllers/publicationController');

const {
  validateCreatePublication,
  validateUpdatePublication
} = require('../validators/publicationValidator');


// ============================================================
// PUBLICATION TYPES
// ============================================================

router.get(
  '/types',
  authMiddleware,
  getPublicationTypes
);


// ============================================================
// CREATE PUBLICATION
// ============================================================

router.post(
  '/',
  authMiddleware,
  allowRoles('super_admin', 'faculty', 'student'),
  upload.single('file'),
  validateCreatePublication,
  createPublication
);

// ============================================================
// GET ALL PUBLICATIONS
// ============================================================

router.get(
  '/',
  authMiddleware,
  allowRoles(
    'super_admin',
    'faculty',
    'student',
    'admin',
    'special_user',
    'directorate'
  ),
  getAllPublications
);


// ============================================================
// GET SINGLE PUBLICATION
// ============================================================

router.get(
  '/:id',
  authMiddleware,
  allowRoles(
    'super_admin',
    'faculty',
    'student',
    'admin',
    'special_user',
    'directorate'
  ),
  getPublicationById
);


// ============================================================
// UPDATE PUBLICATION
// ============================================================

router.put(
  '/:id',
  authMiddleware,
  validateUpdatePublication,
  updatePublication
);


// ============================================================
// APPROVE / REJECT PUBLICATION
// ============================================================

router.put(
  '/:id/status',
  authMiddleware,
  allowRoles('faculty', 'directorate'),
  updatePublicationStatus
);


// ============================================================
// DELETE PUBLICATION
// ============================================================

router.delete(
  '/:id',
  authMiddleware,
  deletePublication
);


module.exports = router;