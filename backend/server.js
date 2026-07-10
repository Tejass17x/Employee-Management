const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { connectDB } = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API Tracker Logger
app.use((req, res, next) => {
    console.log(`[API HIT] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'manu@123',
    database: 'nexus_hr_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ MySQL Database Connected Successfully!');
    connectDB();
});

// ================= LOGIN API =================
app.post('/api/login', (req, res) => {
    console.log("👉 Login attempt for:", req.body.email);
    
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
            console.log("✅ Login Success for:", user.name);
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
    let sql = role === 'Admin' ? "SELECT * FROM users WHERE status = 'Pending' AND role = 'HR'" 
            : role === 'HR' ? "SELECT * FROM users WHERE status = 'Pending' AND role = 'Employee'" : "";
    if(!sql) return res.json([]);
    db.query(sql, (err, results) => res.json(results || []));
});

app.get('/api/users/all', (req, res) => {
    const { role } = req.query;
    let sql = role === 'Admin' ? "SELECT * FROM users WHERE role IN ('HR', 'Admin') ORDER BY id DESC"
            : role === 'HR' ? "SELECT * FROM users WHERE role = 'Employee' ORDER BY id DESC" : "";
    if(!sql) return res.json([]);
    db.query(sql, (err, results) => res.json(results || []));
});

app.put('/api/users/action', (req, res) => {
    db.query("UPDATE users SET status = ? WHERE id = ?", [req.body.action, req.body.userId], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
});

app.delete('/api/users/:id', (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
});

app.put('/api/users/update', (req, res) => {
    const { id, name, email, role } = req.body;
    db.query("UPDATE users SET name=?, email=?, role=? WHERE id=?", [name, email, role, id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
});

// ================= EMPLOYEE ROUTES =================
app.use('/api/employee', employeeRoutes);

// Fallback 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Resource not found: ${req.url}` });
});

app.listen(5000, () => console.log('🚀 Backend perfectly running on port 5000'));