const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var Patient = require('./patient.model');
var Practitioner = require('./practitioner.model')
var Testimonial = connection.define('Testimonial',{
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
	testimonial: {
		type: Sequelize.STRING
	},
	rating: {
		type: Sequelize.DECIMAL(1,0),
		allowNull: false
	}
},{
	timestamps: false,
	freezeTableName: true
});

Practitioner.belongsToMany(Patient,{through: Testimonial, foreignKey: 'pracUsername'});
Patient.belongsToMany(Practitioner,{through: Testimonial, foreignKey: 'patientUsername'});	
module.exports = Testimonial;