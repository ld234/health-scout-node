const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var Practitioner = require('./practitioner.model');
var Specialty = connection.define('Specialty',{
	pracUsername: {
		type: Sequelize.STRING,
		primaryKey: true,
		validate: {
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
	specialty: {
		type:Sequelize.STRING,
		primaryKey: true
	},
	description: {
		type: Sequelize.STRING
	}
},{
	timestamps: false,
	freezeTableName: true
});

Practitioner.hasMany(Specialty,{foreignKey: 'pracUsername'});
module.exports = Specialty;