const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection')

module.exports = (connection) => {
	return connection.define('RegisteredBusiness',{
		ABN: {
			type: Sequelize.DECIMAL(11,0),
			primaryKey:true,
			allowNull: false
		},
		businessName: {
			type: Sequelize.STRING(50),
			allowNull: false
		},
		businessAddress: {
			type: Sequelize.STRING,
			allowNull: false
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}