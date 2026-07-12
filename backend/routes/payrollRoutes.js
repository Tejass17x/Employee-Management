const express = require("express");

const router = express.Router();

const {
  getAllPayrolls,
  getPayrollEmployees,
  createPayroll,
  updatePayroll,
  deletePayroll,
} = require("../controllers/payrollController");

router.get("/", getAllPayrolls);
router.get("/employees", getPayrollEmployees);
router.post("/", createPayroll);
router.put("/:id", updatePayroll);
router.delete("/:id", deletePayroll);

module.exports = router;
