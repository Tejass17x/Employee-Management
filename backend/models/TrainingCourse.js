const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TrainingCourse = sequelize.define('TrainingCourse', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  course_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  progress_percent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed'),
    defaultValue: 'Not Started'
  }
}, {
  tableName: 'training_courses'
});

module.exports = TrainingCourse;
