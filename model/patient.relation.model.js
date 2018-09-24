const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection')
//var Patient = require('./patient.model');

module.exports = (connection) => {
	return connection.define('PatientRelation', {
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
		},
		familyRelation: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		familyCondition: {
			type: Sequelize.STRING
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}

//Patient.hasMany(PatientRelation,{foreignKey: 'patientUsername'});
