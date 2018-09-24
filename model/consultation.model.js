const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (connection) => {
	return connection.define('Consultation',{
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
			references: {
				model: PatientDoctorRelation,
				key: 'pracUsername'
			}
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
			references: {
				model: PatientDoctorRelation,
				key: 'patientUsername'
			}
		},
		consultDate: {
			type: Sequelize.DATEONLY,
			allowNull: false,
			get(){
				let time = this.getDataValue('consultDate');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('consultDate')).format('DD-MM-YYYY');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('consultDate', moment.utc(val,'DD-MM-YYYY').toDate());
			}
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false
		},
		summary: {
			type: Sequelize.TEXT
		},
		intervention: {
			type: Sequelize.TEXT
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}