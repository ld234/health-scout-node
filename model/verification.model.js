const Sequelize = require('sequelize');
//const connection = require('../db/sql-connection');
//const User = require('./user.model');

module.exports = (connection) => {
	return connection.define('verification',{
		username: { 
			type: Sequelize.STRING(20),
			primaryKey: true,
			allowNull: false
		},
		verification:{
			type: Sequelize.STRING(100),
			allowNull: false,
			unique: true
		},
	}, {
		timestamps: false,
		freezeTableName: true
	});
}

//Verification.belongsTo(User,{foreignKey: 'username'});