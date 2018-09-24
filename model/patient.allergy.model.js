const Sequelize = require('sequelize');

module.exports = (connection) => {
	return connection.define('PatientAllergy',{
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
		allergy: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		symptom: {
			type: Sequelize.STRING
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}