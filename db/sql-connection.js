const Sequelize = require('sequelize');
require('dotenv').config();

const connection = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
	dialectOptions: {
		multipleStatements: true
	},
    operatorsAliases: false,
    logging: false,
});

module.exports = connection;



