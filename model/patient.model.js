const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection')
var User = require('./user.model');

module.exports = (connection) => {
	return connection.define('Patient',{
		patientUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				len: {
					args: [8,30],
					msg: 'Please enter username with at lease 8 but max 30 characters'
				},
				isAlphanumeric: true
			},
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}

//Patient.belongsTo(User,{foreignKey: 'patientUsername'});
