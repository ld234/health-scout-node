const Sequelize = require('sequelize');
const DocumentModel= require('../model/document.model');

module.exports = (connection) => {
	return connection.define('PatientDoctorDocument',{
		pracUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				isAlphanumeric: true
			},
		},
		patientUsername: {
			type: Sequelize.STRING,
			primaryKey:true,
			validate: {
				isAlphanumeric:true
			}
		},
		title: {
			type: Sequelize.STRING,
			primaryKey: true,
		}
	},{
		timestamps: false,
		freezeTableName: true,
	})
}