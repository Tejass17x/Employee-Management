const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmployeeProfile = sequelize.define('EmployeeProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  job_title: {
    type: DataTypes.STRING(100),
    defaultValue: 'Senior Software Engineer'
  },
  department: {
    type: DataTypes.STRING(100),
    defaultValue: 'Engineering'
  },
  joining_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  employee_id: {
    type: DataTypes.STRING(50),
    defaultValue: 'NEX-2026-042'
  },
  skills_json: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  certifications_json: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergency_contact_relation: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'employee_profiles'
});

module.exports = EmployeeProfile;
