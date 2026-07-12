DROP DATABASE IF EXISTS nexus_hr_db;
CREATE DATABASE nexus_hr_db;
USE nexus_hr_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'HR', 'Employee') DEFAULT 'Employee',
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Existing Seed Users
INSERT INTO users (name, email, password, role, status) VALUES 
('James Admin', 'admin@nexus.io', 'admin123', 'Admin', 'Approved'),
('Sarah HR', 'hr@nexus.io', 'hr123', 'HR', 'Approved'),
('Alex Employee', 'alex@nexus.io', 'emp123', 'Employee', 'Approved');

-- 1. Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Attendance
INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status) VALUES
(3, '2026-07-01', '09:00:00', '18:00:00', 'Present'),
(3, '2026-07-02', '09:15:00', '18:00:00', 'Present'),
(3, '2026-07-03', '08:55:00', '17:30:00', 'Present'),
(3, '2026-07-06', '09:45:00', '18:00:00', 'Late'),
(3, '2026-07-07', '09:05:00', '18:05:00', 'Present'),
(3, '2026-07-08', '09:00:00', '18:00:00', 'Present');

-- 2. Leave Balances Table
CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    casual_days INT DEFAULT 10,
    sick_days INT DEFAULT 10,
    earned_days INT DEFAULT 15,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Leave Balances
INSERT INTO leave_balances (user_id, casual_days, sick_days, earned_days) VALUES
(3, 8, 9, 14);

-- 3. Leave Requests Table
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('Casual', 'Sick', 'Earned') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Leave Requests
INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status) VALUES
(3, 'Sick', '2026-06-15', '2026-06-16', 'Severe Migraine', 'Approved'),
(3, 'Casual', '2026-07-20', '2026-07-22', 'Family function', 'Pending');

-- 4. Tasks Table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    due_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Tasks
INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES
(3, 'Setup production deployment pipeline', 'Configure CI/CD actions with GitHub and staging environment', 'In Progress', 'High', '2026-07-15'),
(3, 'Fix performance of dashboard query', 'Optimize index and query plan for user stats retrieval', 'To Do', 'Medium', '2026-07-18'),
(3, 'Write test cases for Auth service', 'Increase coverage for login and registration handlers', 'Done', 'Low', '2026-07-05'),
(3, 'Implement search logic for directory', 'Search by name, department, role', 'Done', 'Medium', '2026-07-02');

-- 5. Payslips Table
CREATE TABLE payslips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    basic DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    net_pay DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Payslips
INSERT INTO payslips (user_id, month, year, basic, allowances, deductions, net_pay) VALUES
(3, 'May', 2026, 8000.00, 1200.00, 400.00, 8800.00),
(3, 'June', 2026, 8000.00, 1200.00, 400.00, 8800.00);

-- 6. Performance Reviews Table
CREATE TABLE performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    review_period VARCHAR(50) NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    goals_json TEXT,
    reviewer_comments TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Performance Reviews
INSERT INTO performance_reviews (user_id, review_period, score, goals_json, reviewer_comments) VALUES
(3, 'Q1 - 2026', 4.50, '[{"goal":"Deliver authentication system","status":"Completed"},{"goal":"Optimize React rendering","status":"In Progress"}]', 'Alex shows high commitment. Great progress on engineering tasks.');

-- 7. Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Notifications
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
(3, 'System', 'Welcome to Nexus Portal', 'Your account has been successfully approved by HR.', 1),
(3, 'Task', 'New Task Assigned', 'You have been assigned the task: "Setup production deployment pipeline".', 0),
(3, 'Leave', 'Leave Approved', 'Your sick leave request for June 15 has been approved.', 1);

-- 8. Training Courses Table
CREATE TABLE training_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    progress_percent INT DEFAULT 0,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Training Courses
INSERT INTO training_courses (user_id, course_name, progress_percent, status) VALUES
(3, 'OAuth2 & OpenID Connect Architecture', 100, 'Completed'),
(3, 'Advanced Sequelize & Database Optimization', 45, 'In Progress'),
(3, 'Docker Containers & Kubernetes Essentials', 0, 'Not Started');

-- 9. Documents Table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Documents
INSERT INTO documents (user_id, file_name, file_type, uploaded_at) VALUES
(3, 'employment_agreement_alex.pdf', 'PDF/Contract', '2026-07-01 10:00:00'),
(3, 'tax_declaration_form_2026.pdf', 'PDF/Finance', '2026-07-02 11:30:00');

-- 10. Chat Messages Table
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Chat Messages
INSERT INTO chat_messages (sender_id, receiver_id, message, sent_at) VALUES
(2, 3, 'Hi Alex, let know when the dashboard implementation is ready for review.', '2026-07-08 09:30:00'),
(3, 2, 'Good morning Sarah, sure! I am building the APIs right now.', '2026-07-08 09:35:00'),
(2, 3, 'Great, thank you!', '2026-07-08 09:36:00'),
(1, 3, 'Hey Alex, do you need database credentials for test connection?', '2026-07-08 10:15:00'),
(3, 1, 'Yes James, I already configured it to use root and manu@123.', '2026-07-08 10:20:00');

-- 11. Employee Profiles Table
CREATE TABLE employee_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    job_title VARCHAR(100) DEFAULT 'Senior Software Engineer',
    department VARCHAR(100) DEFAULT 'Engineering',
    joining_date DATE,
    employee_id VARCHAR(50) DEFAULT 'NEX-2026-042',
    skills_json TEXT,
    certifications_json TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_relation VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Employee Profile
INSERT INTO employee_profiles (user_id, phone, address, job_title, department, joining_date, employee_id, skills_json, certifications_json, emergency_contact_name, emergency_contact_relation, emergency_contact_phone) VALUES
(3, '+1-555-0199', '123 Tech Lane, Silicon Valley, CA', 'Senior Frontend Engineer', 'Engineering', '2026-01-10', 'NEX-2026-042', 
 '[{"name":"React","level":90},{"name":"JavaScript","level":95},{"name":"Node.js","level":80},{"name":"CSS/Tailwind","level":85}]',
 '["AWS Certified Developer Associate", "Scrum Master Certification (PSM I)"]',
 'Mary Doe', 'Spouse', '+1-555-0188');
-- 12. System Settings Table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed System Settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('organization', JSON_OBJECT('companyName', 'Nexus HR', 'companyEmail', 'admin@nexus.io', 'timezone', 'Asia/Calcutta', 'fiscalYearStart', 'January', 'defaultCurrency', 'USD')),
('security', JSON_OBJECT('requireApprovalForSignup', true, 'allowEmployeeSelfRegistration', true, 'sessionTimeoutMinutes', 60, 'passwordMinLength', 8, 'maintenanceMode', false)),
('attendance', JSON_OBJECT('workdayStart', '09:00', 'workdayEnd', '18:00', 'lateGraceMinutes', 15, 'weeklyWorkDays', 5, 'allowSelfCheckout', true)),
('payroll', JSON_OBJECT('payrollCycle', 'Monthly', 'payDay', 30, 'overtimeEnabled', false, 'taxDeductionLabel', 'Taxes & PF', 'autoGeneratePayslips', false)),
('notifications', JSON_OBJECT('emailNotifications', true, 'leaveAlerts', true, 'payrollAlerts', true, 'taskAlerts', true, 'systemDigest', 'Weekly'));

-- 13. Audit Logs Table
CREATE TABLE audit_logs (
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

-- Seed Audit Logs
INSERT INTO audit_logs (actor_id, actor_role, action, module, method, endpoint, status_code, ip_address, details, created_at) VALUES
(1, 'Admin', 'Initial System Setup', 'System', 'POST', '/api/admin/settings', 200, '127.0.0.1', JSON_OBJECT('message', 'Default settings configured'), '2026-07-11 09:00:00'),
(1, 'Admin', 'Create Payroll', 'Payroll', 'POST', '/api/payroll', 201, '127.0.0.1', JSON_OBJECT('period', 'June 2026'), '2026-07-11 10:15:00'),
(1, 'Admin', 'Review User Access', 'User Management', 'PUT', '/api/users/action', 200, '127.0.0.1', JSON_OBJECT('status', 'Approved'), '2026-07-11 11:30:00');
