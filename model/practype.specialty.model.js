const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var PracTypeSpecialty = connection.define('PracTypeSpecialty', {
	specialtyName: {
		type: Sequelize.STRING(50),
		primaryKey: true,
		validate: {
			isAlphanumeric: true
        }
	},
	pracType: {
		type: Sequelize.ENUM('Physiotherapist','Dietitian','Exercise physiologist'),
		allowNull: false,
		primary: true
	},
	
},{
	timestamps: false,
	freezeTableName: true
});

module.exports = PracTypeSpecialty;