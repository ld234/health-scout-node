const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var Practitioner = require('./practitioner.model');
var Qualification = connection.define('Qualification', {
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
	degree: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	institution: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	graduateYear: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	description: {
		type: Sequelize.STRING
	}
},{
	timestamps: false,
	freezeTableName: true
});

Practitioner.hasMany(Qualification,{foreignKey: 'pracUsername'});