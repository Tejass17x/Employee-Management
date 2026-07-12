const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { connectDB } = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const { auditWriteRequests } = require("./utils/auditLogger");
const hrRoutes = require('./routes/hrRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(auditWriteRequests);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/hr", hrRoutes);

// API Tracker Logger
app.use((req, res, next) => {
    console.log(`[API HIT] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'Manya@2026',
    database: 'nexus_hr_db'
});

module.exports.db = db;

db.connect((err) => {
    if (err) {
        console.log("❌ MySQL Connection Failed:", err.message);
        return;
    }
    console.log("✅ MySQL Database Connected Successfully!");
    connectDB();
});
const runtimeSettingDefaults = {
    security: {
        requireApprovalForSignup: true,
        allowEmployeeSelfRegistration: true,
        sessionTimeoutMinutes: 60,
        passwordMinLength: 8,
        maintenanceMode: false,
    }
};

const getRuntimeSetting = async (section) => {
    try {
        const [rows] = await db.promise().query("SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1", [section]);
        if (!rows.length) return runtimeSettingDefaults[section] || {};

        const value = typeof rows[0].setting_value === 'string'
            ? JSON.parse(rows[0].setting_value)
            : rows[0].setting_value;

        return {
            ...(runtimeSettingDefaults[section] || {}),
            ...(value || {})
        };
    } catch (error) {
        return runtimeSettingDefaults[section] || {};
    }
};

// ================= LOGIN API =================
app.post('/api/login', (req, res) => {
    console.log("ðŸ‘‰ Login attempt for:", req.body.email);
    
    const { email, password, role } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ? AND role = ?";
    
    db.query(sql, [email, password, role], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });
        
        if (results.length > 0) {
            const user = results[0];
            if (user.role !== 'Admin') {
                if (user.status === 'Pending') return res.status(403).json({ success: false, message: "Account pending approval." });
                if (user.status === 'Rejected') return res.status(403).json({ success: false, message: "Account rejected." });
            }
            console.log("âœ… Login Success for:", user.name);
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials!" });
        }
    });
});

// ================= SIGN UP API =================
app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length > 0) return res.status(400).json({ success: false, message: "Email already exists!" });

        const sql = "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'Pending')";
        db.query(sql, [name, email, password, role], (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Account created!" });
        });
    });
});

// ================= DASHBOARD APIs =================
app.get('/api/users/pending', (req, res) => {
    const { role } = req.query;
    let sql = "SELECT id, name, email, role, status, created_at FROM users WHERE status = 'Pending'";
    if (role === 'Admin') {
        sql += " AND role = 'HR'";
    } else if (role === 'HR') {
        sql += " AND role = 'Employee'";
    }

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results || []);
    });
});

app.get('/api/users/all', (req, res) => {
    const { role } = req.query;
    let sql = "SELECT id, name, email, role, status, created_at FROM users";

    if (role === 'HR') {
        sql += " WHERE role = 'Employee'";
    } else if (role === 'Employee') {
        sql += " WHERE role = 'Employee'";
    }

    sql += " ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results || []);
    });
});

app.put('/api/users/action', (req, res) => {
    const { action, userId } = req.body;
    db.query("UPDATE users SET status = ? WHERE id = ?", [action, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/users/:id', (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put('/api/users/update', (req, res) => {
    const { id, name, email, role, status } = req.body;
    db.query("UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?", [name, email, role, status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ================= EMPLOYEE ROUTES =================
app.use('/api/employee', employeeRoutes);

// ================= HR Routes =================
app.use('/api/hr', hrRoutes);
// Fallback 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Resource not found: ${req.url}` });
});

app.listen(5000, () => console.log('ðŸš€ Backend perfectly running on port 5000'));

