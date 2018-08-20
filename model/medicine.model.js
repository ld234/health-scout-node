const Sequelize = require('sequelize');
const connection = require('../db/sql-connection');
var Consultation = require('./consultation.model');

var Medicine = connection.define('Medicine',{
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
		/*references: {
			model: Consultation,
			key: 'pracUsername'
		}*/
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
		/*references: {
			model: Consultation,
			key: 'patientUsername'
		}*/
	},
	consultDate: {
		type: Sequelize.DATEONLY,
		primaryKey: true,
		/*references: {
			model: Consultation,
			key: 'consultDate'
		}*/
	},
	medication: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	strength: {
		type: Sequelize.DECIMAL(11,2),
		allowNull: true
	},
	condition: {
		type: Sequelize.STRING,
		allowNull: true
	},
	refill: {
		type: Sequelize.DECIMAL(11,0),
		allowNull: true
	}
},{
	timestamps: false,
	freezeTableName: true
});

module.exports=Medicine;