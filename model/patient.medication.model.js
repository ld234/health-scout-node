const Sequelize = require('sequelize');
const moment=require('moment');

module.exports= (connection) => {
	return connection.define('PatientMedication',{
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
		medication: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		prescribedDate: {
			type: Sequelize.DATEONLY,
			primaryKey: true,
			get(){
				let time = this.getDataValue('prescribedDate');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('prescribedDate')).format('DD-MM-YYYY');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('prescribedDate', moment.utc(val,'DD-MM-YYYY').toDate());
			}
		},
		prescribedBy: {
			type: Sequelize.STRING,
			allowNull: true,
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
		freezeTableName:true
	})
}