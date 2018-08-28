const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection');
//var PatientDoctorRelation = require('./patient.doctor.relation.model');

module.exports = (connection) => {
	return connection.define('Consultation',{
		pracUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				/*len: {
					args: [8,30],
					msg: 'Please enter username with at lease 8 but max 30 characters'
				},*/
				isAlphanumeric: true
			},
			references: {
				model: PatientDoctorRelation,
				key: 'pracUsername'
			}
		},
		patientUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				/*len: {
					args: [8,30],
					msg: 'Please enter username with at lease 8 but max 30 characters'
				},*/
				isAlphanumeric: true
			},
			references: {
				model: PatientDoctorRelation,
				key: 'patientUsername'
			}
		},
		consultDate: {
			type: Sequelize.DATEONLY,
			primaryKey: true
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false
		},
		summary: {
			type: Sequelize.TEXT
		},
		intervention: {
			type: Sequelize.TEXT
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}