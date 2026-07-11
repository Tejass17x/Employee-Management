const express = require("express");
const router = express.Router();

const {
  getOverview,
  getEmployees,
  approveLeave,
  getPendingLeaves
} = require("../controllers/hrController");

router.get("/overview", getOverview);

router.get("/employees", getEmployees);

router.get("/leave", getPendingLeaves);

router.put("/leave/:id", approveLeave);

module.exports = router;