const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getSystemReports,
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
  getAuditLogs,
  deleteAuditLog,
  clearAuditLogs,
} = require("../controllers/adminDashboardController");

router.get("/dashboard", getDashboardStats);
router.get("/reports", getSystemReports);
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);
router.post("/settings/reset", resetSystemSettings);
router.get("/audit-logs", getAuditLogs);
router.delete("/audit-logs/:id", deleteAuditLog);
router.delete("/audit-logs", clearAuditLogs);

module.exports = router;
