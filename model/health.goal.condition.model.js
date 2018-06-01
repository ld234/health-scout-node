const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var Patient = require('./patient.model');
var Practitioner = require('./practitioner.model')
var HealthGoalCondition = connection.define('HealthGoalCondition',{
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
	conditions: Sequelize.STRING
},{
	timestamps: false,
	freezeTableName: true
})

Practitioner.belongsToMany(Patient,{through: HealthGoalCondition, foreignKey: 'pracUsername'});
Patient.belongsToMany(Practitioner,{through: HealthGoalCondition, foreignKey: 'patientUsername'});

module.exports = HealthGoalCondition;