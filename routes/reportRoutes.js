const express = require("express");

const router = express.Router();


// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

const authMiddleware = require("../middleware/authMiddleware");


// ============================================================
// REPORT CONTROLLER
// ============================================================

const {
  exportPublicationsToExcel
} = require("../controllers/reportController");


// ============================================================
// PUBLICATION EXCEL EXPORT
// ============================================================
//
// GET /api/reports/publications/excel?type=all
//
// Examples:
//
// ?type=all
// ?type=journal
// ?type=book
// ?type=book_chapter
// ?type=conference
// ?type=patent
// ?type=research_project
// ?type=consultancy
// ?type=research_collaboration
// ?type=research_support
//
// ============================================================

router.get(
  "/publications/excel",
  authMiddleware,
  exportPublicationsToExcel
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;