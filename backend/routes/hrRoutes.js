const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");

// Get HR Overview
router.get("/overview", async (req, res) => {
    try {
        const [empResult] = await sequelize.query(
            "SELECT COUNT(*) AS totalEmployees FROM users WHERE role = 'Employee' AND status = 'Approved'"
        );
        const [pendingResult] = await sequelize.query(
            "SELECT COUNT(*) AS pendingLeaves FROM leave_requests WHERE status = 'Pending'"
        );
        const [approvedResult] = await sequelize.query(
            "SELECT COUNT(*) AS approvedLeaves FROM leave_requests WHERE status = 'Approved'"
        );

        res.json({
            success: true,
            totalEmployees: empResult[0].totalEmployees,
            pendingLeaves: pendingResult[0].pendingLeaves,
            approvedLeaves: approvedResult[0].approvedLeaves,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

// Get all employees
router.get("/employees", async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT id, name, email, role, status, created_at FROM users WHERE role = 'Employee' AND status = 'Approved'"
        );
        res.json({ success: true, employees: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

// Get pending leave requests
router.get("/leave", async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT * FROM leave_requests WHERE status = 'Pending' ORDER BY applied_at DESC"
        );
        res.json({ success: true, leaves: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

// Approve a leave request
router.put("/leave/:id", async (req, res) => {
    try {
        await sequelize.query(
            "UPDATE leave_requests SET status = 'Approved' WHERE id = ?",
            { replacements: [req.params.id] }
        );
        res.json({ success: true, message: "Leave Approved Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

router.get("/departments", async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT * FROM departments"
        );

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database error"
        });
    }
});

// Get all job openings
router.get("/jobs", async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT * FROM job_openings"
        );

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database error"
        });
    }
});

// Get all candidates
router.get("/candidates", async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT * FROM candidates"
        );

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database error"
        });
    }
});

// Get performance reviews
router.get("/performance", async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT * FROM hr_performance_reviews"
        );

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database error"
        });
    }
});

router.post("/jobs", async (req, res) => {
    try {
        const { title, department, status } = req.body;

        await sequelize.query(
            `INSERT INTO job_openings
            (title, department, candidates, status, posted_date)
            VALUES (?, ?, ?, ?, CURDATE())`,
            {
                replacements: [title, department, 0, status]
            }
        );

        res.json({
            success: true,
            message: "Job created successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});

router.post("/departments", async (req, res) => {
    try {
      const {
        name,
        head_name,
        employee_count,
        budget,
        open_positions
      } = req.body;
  
      await sequelize.query(
        `INSERT INTO departments
        (name, head_name, employee_count, budget, open_positions)
        VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [
            name,
            head_name,
            employee_count,
            budget,
            open_positions
          ]
        }
      );
  
      res.json({
        success: true,
        message: "Department created successfully"
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Database error"
      });
    }
  });
module.exports = router;