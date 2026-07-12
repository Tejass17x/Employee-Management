const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { ensureAuditLogTable } = require("../utils/auditLogger");

const getDashboardStats = async (req, res) => {
  try {
    const [payroll] = await sequelize.query(`
      SELECT IFNULL(SUM(net_pay),0) AS monthlyPayroll
      FROM payslips;
    `);

    const [tenure] = await sequelize.query(`
      SELECT ROUND(
        AVG(TIMESTAMPDIFF(MONTH, joining_date, CURDATE())) / 12,
        1
      ) AS avgTenure
      FROM employee_profiles;
    `);

    const [retention] = await sequelize.query(`
      SELECT ROUND(
        (COUNT(CASE WHEN status='Approved' THEN 1 END) * 100.0) / COUNT(*),
        1
      ) AS retentionRate
      FROM users;
    `);

    res.json({
      success: true,
      monthlyPayroll: payroll[0].monthlyPayroll,
      avgTenure: tenure[0].avgTenure,
      retentionRate: retention[0].retentionRate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats"
    });
  }
};

const getSystemReports = async (req, res) => {
  const startDate = req.query.startDate || "2026-01-01";
  const endDate = req.query.endDate || new Date().toISOString().slice(0, 10);
  const replacements = { startDate, endDate };

  try {
    const [
      summaryRows,
      roleBreakdown,
      statusBreakdown,
      payrollByPeriod,
      attendanceByStatus,
      leaveByStatus,
      taskByStatus,
      departmentBreakdown,
      trainingStatus,
      recentPayrolls,
      recentLeaveRequests,
      topPayrollRecipients,
    ] = await Promise.all([
      sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM users) AS totalUsers,
          (SELECT COUNT(*) FROM users WHERE status = 'Approved') AS approvedUsers,
          (SELECT COUNT(*) FROM users WHERE role = 'Employee' AND status = 'Approved') AS activeEmployees,
          (SELECT COUNT(*) FROM users WHERE role IN ('Admin', 'HR') AND status = 'Approved') AS adminHrUsers,
          (SELECT IFNULL(SUM(net_pay), 0) FROM payslips) AS payrollTotal,
          (SELECT IFNULL(AVG(net_pay), 0) FROM payslips) AS averageNetPay,
          (SELECT COUNT(*) FROM attendance WHERE date BETWEEN :startDate AND :endDate) AS attendanceRecords,
          (SELECT COUNT(*) FROM attendance WHERE status IN ('Present', 'Late') AND date BETWEEN :startDate AND :endDate) AS presentAttendance,
          (SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending' AND DATE(applied_at) BETWEEN :startDate AND :endDate) AS pendingLeaves,
          (SELECT COUNT(*) FROM tasks WHERE status IN ('To Do', 'In Progress')) AS openTasks;
      `, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT role, COUNT(*) AS total,
          SUM(status = 'Approved') AS approved,
          SUM(status = 'Pending') AS pending,
          SUM(status = 'Rejected') AS rejected
        FROM users
        GROUP BY role
        ORDER BY FIELD(role, 'Admin', 'HR', 'Employee');
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT status, COUNT(*) AS total
        FROM users
        GROUP BY status
        ORDER BY FIELD(status, 'Approved', 'Pending', 'Rejected');
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT month, year,
          COUNT(*) AS records,
          IFNULL(SUM(basic + allowances), 0) AS grossPay,
          IFNULL(SUM(deductions), 0) AS deductions,
          IFNULL(SUM(net_pay), 0) AS netPay
        FROM payslips
        GROUP BY year, month
        ORDER BY year ASC, FIELD(month, 'January','February','March','April','May','June','July','August','September','October','November','December') ASC;
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT status, COUNT(*) AS total
        FROM attendance
        WHERE date BETWEEN :startDate AND :endDate
        GROUP BY status
        ORDER BY total DESC;
      `, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT status, COUNT(*) AS total
        FROM leave_requests
        WHERE DATE(applied_at) BETWEEN :startDate AND :endDate
        GROUP BY status
        ORDER BY FIELD(status, 'Pending', 'Approved', 'Rejected');
      `, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT status, COUNT(*) AS total
        FROM tasks
        GROUP BY status
        ORDER BY FIELD(status, 'To Do', 'In Progress', 'Done');
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT COALESCE(department, 'Unassigned') AS department, COUNT(*) AS total
        FROM employee_profiles
        GROUP BY COALESCE(department, 'Unassigned')
        ORDER BY total DESC;
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT status, COUNT(*) AS total, ROUND(AVG(progress_percent), 1) AS avgProgress
        FROM training_courses
        GROUP BY status
        ORDER BY FIELD(status, 'Not Started', 'In Progress', 'Completed');
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT p.id, p.month, p.year, p.basic, p.allowances, p.deductions, p.net_pay AS netPay,
          u.name, u.email, u.role
        FROM payslips p
        LEFT JOIN users u ON u.id = p.user_id
        ORDER BY p.year DESC, FIELD(p.month, 'December','November','October','September','August','July','June','May','April','March','February','January') ASC, p.id DESC
        LIMIT 10;
      `, { type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT l.id, l.leave_type AS leaveType, l.start_date AS startDate, l.end_date AS endDate,
          l.status, l.applied_at AS appliedAt, u.name, u.email, u.role
        FROM leave_requests l
        LEFT JOIN users u ON u.id = l.user_id
        WHERE DATE(l.applied_at) BETWEEN :startDate AND :endDate
        ORDER BY l.applied_at DESC
        LIMIT 10;
      `, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(`
        SELECT u.id, u.name, u.email, u.role,
          COUNT(p.id) AS payrollCount,
          IFNULL(SUM(p.net_pay), 0) AS totalNetPay
        FROM users u
        INNER JOIN payslips p ON p.user_id = u.id
        GROUP BY u.id, u.name, u.email, u.role
        ORDER BY totalNetPay DESC
        LIMIT 8;
      `, { type: QueryTypes.SELECT }),
    ]);

    const summary = summaryRows[0] || {};
    const attendanceRate = Number(summary.attendanceRecords) > 0
      ? Math.round((Number(summary.presentAttendance) / Number(summary.attendanceRecords)) * 100)
      : 0;

    res.json({
      success: true,
      filters: { startDate, endDate },
      summary: {
        ...summary,
        attendanceRate,
      },
      roleBreakdown,
      statusBreakdown,
      payrollByPeriod,
      attendanceByStatus,
      leaveByStatus,
      taskByStatus,
      departmentBreakdown,
      trainingStatus,
      recentPayrolls,
      recentLeaveRequests,
      topPayrollRecipients,
    });
  } catch (error) {
    console.error("System Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system reports",
    });
  }
};


const defaultSystemSettings = {
  organization: {
    companyName: "Nexus HR",
    companyEmail: "admin@nexus.io",
    timezone: "Asia/Calcutta",
    fiscalYearStart: "January",
    defaultCurrency: "USD",
  },
  security: {
    requireApprovalForSignup: true,
    allowEmployeeSelfRegistration: true,
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    maintenanceMode: false,
  },
  attendance: {
    workdayStart: "09:00",
    workdayEnd: "18:00",
    lateGraceMinutes: 15,
    weeklyWorkDays: 5,
    allowSelfCheckout: true,
  },
  payroll: {
    payrollCycle: "Monthly",
    payDay: 30,
    overtimeEnabled: false,
    taxDeductionLabel: "Taxes & PF",
    autoGeneratePayslips: false,
  },
  notifications: {
    emailNotifications: true,
    leaveAlerts: true,
    payrollAlerts: true,
    taskAlerts: true,
    systemDigest: "Weekly",
  },
};

const ensureSettingsTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
};

const getSystemSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const rows = await sequelize.query(
      "SELECT setting_key AS settingKey, setting_value AS settingValue, updated_at AS updatedAt FROM system_settings ORDER BY setting_key ASC",
      { type: QueryTypes.SELECT }
    );

    const settings = { ...defaultSystemSettings };
    const updatedAt = rows.reduce((latest, row) => {
      let parsedValue = row.settingValue;
      if (typeof parsedValue === "string") {
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch (error) {
          parsedValue = defaultSystemSettings[row.settingKey] || {};
        }
      }

      settings[row.settingKey] = {
        ...(defaultSystemSettings[row.settingKey] || {}),
        ...(parsedValue || {}),
      };

      if (!latest || new Date(row.updatedAt) > new Date(latest)) {
        return row.updatedAt;
      }
      return latest;
    }, null);

    res.json({
      success: true,
      settings,
      updatedAt,
      defaults: defaultSystemSettings,
    });
  } catch (error) {
    console.error("System Settings Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system settings",
    });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const incomingSettings = req.body.settings || {};
    const sanitizedSettings = {};

    Object.keys(defaultSystemSettings).forEach((sectionKey) => {
      sanitizedSettings[sectionKey] = {
        ...defaultSystemSettings[sectionKey],
        ...(incomingSettings[sectionKey] || {}),
      };
    });

    await Promise.all(Object.entries(sanitizedSettings).map(([settingKey, settingValue]) => {
      return sequelize.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES (:settingKey, CAST(:settingValue AS JSON))
         ON DUPLICATE KEY UPDATE setting_value = CAST(:settingValue AS JSON), updated_at = CURRENT_TIMESTAMP`,
        {
          replacements: {
            settingKey,
            settingValue: JSON.stringify(settingValue),
          },
        }
      );
    }));

    res.json({
      success: true,
      message: "System settings updated successfully",
      settings: sanitizedSettings,
    });
  } catch (error) {
    console.error("System Settings Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update system settings",
    });
  }
};

const resetSystemSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    await Promise.all(Object.entries(defaultSystemSettings).map(([settingKey, settingValue]) => {
      return sequelize.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES (:settingKey, CAST(:settingValue AS JSON))
         ON DUPLICATE KEY UPDATE setting_value = CAST(:settingValue AS JSON), updated_at = CURRENT_TIMESTAMP`,
        {
          replacements: {
            settingKey,
            settingValue: JSON.stringify(settingValue),
          },
        }
      );
    }));

    res.json({
      success: true,
      message: "System settings reset to defaults",
      settings: defaultSystemSettings,
    });
  } catch (error) {
    console.error("System Settings Reset Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset system settings",
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    await ensureAuditLogTable();

    const {
      module = "All",
      actorRole = "All",
      status = "All",
      search = "",
      startDate,
      endDate,
      limit = 100,
    } = req.query;

    const where = [];
    const replacements = {
      search: `%${search}%`,
      limit: Math.min(Number(limit) || 100, 500),
    };

    if (module !== "All") {
      where.push("module = :module");
      replacements.module = module;
    }

    if (actorRole !== "All") {
      where.push("actor_role = :actorRole");
      replacements.actorRole = actorRole;
    }

    if (status === "Success") where.push("status_code < 400");
    if (status === "Failed") where.push("status_code >= 400");

    if (startDate) {
      where.push("DATE(created_at) >= :startDate");
      replacements.startDate = startDate;
    }

    if (endDate) {
      where.push("DATE(created_at) <= :endDate");
      replacements.endDate = endDate;
    }

    if (search) {
      where.push("(action LIKE :search OR module LIKE :search OR endpoint LIKE :search OR actor_role LIKE :search)");
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const logs = await sequelize.query(`
      SELECT id, actor_id AS actorId, actor_role AS actorRole, action, module, method, endpoint,
        status_code AS statusCode, ip_address AS ipAddress, details, created_at AS createdAt
      FROM audit_logs
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT :limit;
    `, { replacements, type: QueryTypes.SELECT });

    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) AS totalLogs,
        SUM(status_code < 400) AS successfulActions,
        SUM(status_code >= 400) AS failedActions,
        COUNT(DISTINCT module) AS activeModules,
        MAX(created_at) AS latestActivity
      FROM audit_logs;
    `, { type: QueryTypes.SELECT });

    const moduleBreakdown = await sequelize.query(`
      SELECT module, COUNT(*) AS total
      FROM audit_logs
      GROUP BY module
      ORDER BY total DESC;
    `, { type: QueryTypes.SELECT });

    const actorBreakdown = await sequelize.query(`
      SELECT actor_role AS actorRole, COUNT(*) AS total
      FROM audit_logs
      GROUP BY actor_role
      ORDER BY total DESC;
    `, { type: QueryTypes.SELECT });

    const modules = await sequelize.query(`
      SELECT DISTINCT module
      FROM audit_logs
      ORDER BY module ASC;
    `, { type: QueryTypes.SELECT });

    res.json({
      success: true,
      logs,
      stats: stats || {},
      moduleBreakdown,
      actorBreakdown,
      modules: modules.map((item) => item.module),
    });
  } catch (error) {
    console.error("Audit Logs Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
};

const deleteAuditLog = async (req, res) => {
  try {
    await ensureAuditLogTable();
    const result = await sequelize.query("DELETE FROM audit_logs WHERE id = :id", {
      replacements: { id: req.params.id },
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error("Audit Log Delete Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete audit log" });
  }
};

const clearAuditLogs = async (req, res) => {
  try {
    await ensureAuditLogTable();
    await sequelize.query("DELETE FROM audit_logs");
    res.json({ success: true, message: "Audit logs cleared" });
  } catch (error) {
    console.error("Audit Logs Clear Error:", error);
    res.status(500).json({ success: false, message: "Failed to clear audit logs" });
  }
};
module.exports = {
  getDashboardStats,
  getSystemReports,
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
  getAuditLogs,
  deleteAuditLog,
  clearAuditLogs,
};
