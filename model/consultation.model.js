const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var Patient = require('./patient.model');
var Practitioner = require('./practitioner.model')
var Consultation = connection.define('Consultation',{
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

Practitioner.belongsToMany(Patient,{through: Consultation, foreignKey: 'pracUsername'});
Patient.belongsToMany(Practitioner,{through: Consultation, foreignKey: 'patientUsername'});
module.exports = Consultation;