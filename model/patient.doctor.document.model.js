const Sequelize = require('sequelize');

module.exports = (connection) => {
	return connection.define('PatientDoctorDocument',{
		pracUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				isAlphanumeric: true
			},
		},
		patientUsername: {
			type: Sequelize.STRING,
			primaryKey:true,
			validate: {
				isAlphanumeric:true
			}
		},
		title: {
			type: Sequelize.STRING,
			primaryKey: true
		}
	},{
		timestamps: false,
		freezeTableName: true,
	})
}