const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection')

module.exports = (connection) => {
	return connection.define('PracTypeSpecialty', {
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
			primaryKey: true
		},
		
	},{
		timestamps: false,
		freezeTableName: true
	});
}