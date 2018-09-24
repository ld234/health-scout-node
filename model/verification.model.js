const Sequelize = require('sequelize');

module.exports = (connection) => {
	return connection.define('verification',{
		username: { 
			type: Sequelize.STRING(20),
			primaryKey: true,
			allowNull: false
		},
		verification:{
			type: Sequelize.STRING(100),
			allowNull: false
		},
	}, {
		timestamps: false,
		freezeTableName: true
	});
}