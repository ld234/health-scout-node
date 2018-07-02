const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var User = require('./user.model');
var Practitioner = connection.define('Practitioner', {
	pracUsername: {
		type: Sequelize.STRING(20),
		primaryKey: true,
		validate: {
			isAlphanumeric: true
        },
        references: {
            model: User,
            key: 'username'
        },
	},
	pracType: {
		type: Sequelize.ENUM('Physiotherapist','Dietitian','Exercise physiologist'),
		allowNull: false
	},
	serviceProvided: Sequelize.STRING, 
	ABN: {
	    type: Sequelize.DECIMAL(11,0),
		allowNull: false
	},
	medicareNum: {
	    type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			isAlphanumeric: true
		}
	},
	accBody: {
		type: Sequelize.STRING(50), 
		allowNull: false
	},
	businessName: {
	    type: Sequelize.STRING(50),
		allowNull: false
	},
	businessAddress: {
	    type: Sequelize.STRING,
		allowNull: false
	},
	rating: {
	    type: Sequelize.DECIMAL(3,2),
		allowNull: false
	},
	viewsToday: {
	    type: Sequelize.DECIMAL(4,0),
		allowNull: false
	},
	availableConnections: {
		type: Sequelize.DECIMAL(10,0),
		allowNull: false,
		defaultValue: 0
	}
},{
	timestamps: false,
	freezeTableName: true
});

module.exports = Practitioner;