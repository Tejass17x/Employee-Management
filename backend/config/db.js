const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nexus_hr_db', 'root', 'root', {
  host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: false,
      freezeTableName: true
    }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize Connected to MySQL Database Successfully!');
  } catch (error) {
    console.error('❌ Sequelize connection error:', error);
  }
};

module.exports = { sequelize, connectDB };
