const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection')
//var Practitioner = require('./practitioner.model');

module.exports = (connection) => {
	return connection.define('Specialty',{
		pracUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				isAlphanumeric: true
			},
		},
		specialty: {
			type:Sequelize.STRING,
			primaryKey: true
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}

//Practitioner.hasMany(Specialty,{foreignKey: 'pracUsername'});