const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payslip = sequelize.define('Payslip', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  basic: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  net_pay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'payslips'
});

module.exports = Payslip;
