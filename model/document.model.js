const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var Practitioner = require('./practitioner.model');

var Document = connection.define('Document',{
	pracUsername: {
		type: Sequelize.STRING,
		primaryKey: true,
		validate: {
			isAlphanumeric: true
		},
	},
	title: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	description: {
		type: Sequelize.STRING,
		allowNull:true,
	},
	file: { //the path to the file. We allow the practitioner to upload the same file in different document, only the title need to be unique
		type: Sequelize.STRING,
		allowNull:false,
	}
},{
	timestamps:false,
	freezeTableName:true,
})

Practitioner.hasMany(Document,{foreignKey: 'pracUsername'});
module.exports=Document;