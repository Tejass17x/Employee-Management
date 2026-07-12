const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ensureAuditLogTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      actor_id INT NULL,
      actor_role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      module VARCHAR(100) NOT NULL,
      method VARCHAR(10),
      endpoint VARCHAR(255),
      status_code INT,
      ip_address VARCHAR(100),
      details JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const sanitizeDetails = (details = {}) => {
  const clone = JSON.parse(JSON.stringify(details || {}));
  if (clone.body?.password) clone.body.password = "[hidden]";
  if (clone.password) clone.password = "[hidden]";
  return clone;
};

const getModuleFromPath = (path = "") => {
  if (path.includes("/payroll")) return "Payroll";
  if (path.includes("/settings")) return "System Settings";
  if (path.includes("/reports")) return "System Reports";
  if (path.includes("/users")) return "User Management";
  if (path.includes("/login")) return "Authentication";
  if (path.includes("/register")) return "Registration";
  return "System";
};

const getActionFromRequest = (req) => {
  if (req.auditAction) return req.auditAction;
  const method = req.method || "GET";
  const path = req.originalUrl || req.url || "";

  if (path.includes("/settings/reset")) return "Reset Settings";
  if (path.includes("/settings") && method === "PUT") return "Update Settings";
  if (path.includes("/users/action")) return "Review User Access";
  if (path.includes("/users/update")) return "Update User";
  if (path.includes("/users/") && method === "DELETE") return "Delete User";
  if (path.includes("/payroll") && method === "POST") return "Create Payroll";
  if (path.includes("/payroll") && method === "PUT") return "Update Payroll";
  if (path.includes("/payroll") && method === "DELETE") return "Delete Payroll";
  if (path.includes("/register") && method === "POST") return "Register Account";
  if (path.includes("/login") && method === "POST") return "Login Attempt";

  return `${method} ${getModuleFromPath(path)}`;
};

const recordAuditLog = async ({ req, action, module, statusCode, details }) => {
  try {
    await ensureAuditLogTable();

    await sequelize.query(
      `INSERT INTO audit_logs
        (actor_id, actor_role, action, module, method, endpoint, status_code, ip_address, details)
       VALUES
        (:actorId, :actorRole, :action, :module, :method, :endpoint, :statusCode, :ipAddress, CAST(:details AS JSON))`,
      {
        replacements: {
          actorId: Number(req?.headers?.["x-user-id"]) || null,
          actorRole: req?.headers?.["x-user-role"] || req?.body?.role || "Guest",
          action: action || getActionFromRequest(req || {}),
          module: module || getModuleFromPath(req?.originalUrl || req?.url || ""),
          method: req?.method || null,
          endpoint: req?.originalUrl || req?.url || null,
          statusCode: statusCode || null,
          ipAddress: req?.ip || req?.socket?.remoteAddress || null,
          details: JSON.stringify(sanitizeDetails(details || { body: req?.body, params: req?.params, query: req?.query })),
        },
      }
    );
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
};

const auditWriteRequests = (req, res, next) => {
  const shouldAudit = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
    && !req.originalUrl.includes("/audit-logs")
    && (
      req.originalUrl.startsWith("/api/admin")
      || req.originalUrl.startsWith("/api/payroll")
      || req.originalUrl.startsWith("/api/users")
      || req.originalUrl.startsWith("/api/login")
      || req.originalUrl.startsWith("/api/register")
    );

  if (!shouldAudit) return next();

  res.on("finish", () => {
    void recordAuditLog({
      req,
      statusCode: res.statusCode,
      details: {
        body: req.body,
        params: req.params,
        query: req.query,
        success: res.statusCode < 400,
      },
    });
  });

  return next();
};

module.exports = {
  ensureAuditLogTable,
  recordAuditLog,
  auditWriteRequests,
  getModuleFromPath,
};
