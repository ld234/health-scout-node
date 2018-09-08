const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (connection) => {
	return connection.define('ReceivedDocument',{
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
		},
		receivedLink: {
			type: Sequelize.STRING,
			allowNull:false,
		},
		receivedDate: {
			type: Sequelize.DATE,
			allowNull:false,
			get(){
				let time = this.getDataValue('receivedDate');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('receivedDate')).format('DD-MM-YYYY HH:mm:ss');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('receivedDate', moment.utc(val,'DD-MM-YYYY HH:mm:ss').toDate());
			}
		},
		status: { //whether a not the practitioner have seen the received documents from patients or not
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue:false
		}
	},{
		timestamps: false,
		freezeTableName: true,
	})
}