const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PerformanceReview = sequelize.define('PerformanceReview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  review_period: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false
  },
  goals_json: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewer_comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'performance_reviews'
});

module.exports = PerformanceReview;
