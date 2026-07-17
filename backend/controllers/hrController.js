const User = require("../models/User");
const LeaveRequest = require("../models/LeaveRequest");
const { sequelize } = require("../config/db");

// ================= OVERVIEW =================
const getOverview = async (req, res) => {
  try {
    const totalEmployees = await User.count({
      where: {
        role: "Employee",
        status: "Approved"
      }
    });

    const pendingLeaves = await LeaveRequest.count({
      where: {
        status: "Pending"
      }
    });

    const approvedLeaves = await LeaveRequest.count({
      where: {
        status: "Approved"
      }
    });

    res.json({
      success: true,
      totalEmployees,
      pendingLeaves,
      approvedLeaves
    });

  } catch (error) {
    console.error("Overview Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= EMPLOYEES =================
const getEmployees = async (req, res) => {
  try {

    const employees = await User.findAll({
      where: {
        role: "Employee",
        status: "Approved"
      },
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "status",
        "created_at"
      ]
    });

    res.json({
      success: true,
      employees
    });

  } catch (error) {
    console.error("Employees Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= PENDING LEAVES =================
const getPendingLeaves = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT lr.*, u.name AS employee_name
      FROM leave_requests lr
      LEFT JOIN users u ON u.id = lr.user_id
      WHERE lr.status = 'Pending'
      ORDER BY lr.applied_at DESC
    `);

    res.json({
      success: true,
      leaves: results
    });

  } catch (error) {
    console.error("Pending Leave Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= APPROVE LEAVE =================
const approveLeave = async (req, res) => {
  try {

    const leave = await LeaveRequest.findByPk(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave Request Not Found"
      });
    }

    leave.status = "Approved";

    await leave.save();

    res.json({
      success: true,
      message: "Leave Approved Successfully"
    });

  } catch (error) {
    console.error("Approve Leave Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getOverview,
  getEmployees,
  getPendingLeaves,
  approveLeave
};