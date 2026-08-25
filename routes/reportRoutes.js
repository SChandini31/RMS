const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getPublicationMetrics,
  exportPublicationsToExcel,
} = require("../controllers/reportController");


// ============================================================
// PUBLICATION METRICS
// ============================================================

// GET
// /api/reports/publications?from=2026-08-01&to=2026-08-25

router.get(
  "/publications",
  authMiddleware,
  getPublicationMetrics
);


// ============================================================
// PUBLICATION EXCEL
// ============================================================

// GET
// /api/reports/publications/excel
//
// Examples:
//
// /api/reports/publications/excel?type=all&from=2026-08-01&to=2026-08-25
//
// /api/reports/publications/excel?type=journal&from=2026-08-01&to=2026-08-25

router.get(
  "/publications/excel",
  authMiddleware,
  exportPublicationsToExcel
);


module.exports = router;