const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeaveBalance = sequelize.define('LeaveBalance', {
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
  casual_days: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  sick_days: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  earned_days: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  }
}, {
  tableName: 'leave_balances'
});

module.exports = LeaveBalance;
