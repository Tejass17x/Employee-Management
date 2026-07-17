const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");
const {
  getOverview,
  getEmployees,
  getPendingLeaves,
  approveLeave
} = require("../controllers/hrController");

// HR-specific API routes
router.get("/overview", getOverview);
router.get("/employees", getEmployees);
router.get("/leave", getPendingLeaves);
router.put("/leave/:id", approveLeave);

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