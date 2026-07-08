DROP DATABASE IF EXISTS nexus_hr_db;
CREATE DATABASE nexus_hr_db;
USE nexus_hr_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'HR', 'Employee') DEFAULT 'Employee',
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DHYAN DEIN: Yahan Admin aur HR ko explicitly 'Approved' kiya gaya hai
INSERT INTO users (name, email, password, role, status) VALUES 
('James Admin', 'admin@nexus.io', 'admin123', 'Admin', 'Approved'),
('Sarah HR', 'hr@nexus.io', 'hr123', 'HR', 'Approved'),
('Alex Employee', 'alex@nexus.io', 'emp123', 'Employee', 'Approved');