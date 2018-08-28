const Sequelize = require('sequelize');
/*const connection = require('../db/sql-connection');
var Patient = require('./patient.model');
var Practitioner = require('./practitioner.model');*/

module.exports = (connection) => {
	return connection.define('PatientDoctorRelation',{
		pracUsername: {
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
		goal: Sequelize.STRING,
		conditions: Sequelize.STRING,
		testimonial: {
			type: Sequelize.STRING,
			allowNull: true
		},
		rating: {
			type: Sequelize.DECIMAL(1,0),
			allowNull: true
		},
		seen: {
			type : Sequelize.BOOLEAN,
			defaultValue : false,
			allowNull : false
		},
		message: { //an optional message when first connected that a patient wants to exchange to the practitioner
			type: Sequelize.STRING,
			allowNull: true
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}

//Practitioner.belongsToMany(Patient,{through: PatientDoctorRelation, foreignKey: 'pracUsername'});
//Patient.belongsToMany(Practitioner,{through: PatientDoctorRelation, foreignKey: 'patientUsername'});