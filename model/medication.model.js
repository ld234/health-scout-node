const Sequelize = require('sequelize');
const moment = require('moment');
//const connection = require('../db/sql-connection')
//var Practitioner = require('./practitioner.model');

module.exports = (connection) => {
	return connection.define('Medication',{
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
		fillDate: {
			type: Sequelize.DATEONLY,
            primaryKey: true,
            get(){
				let time = this.getDataValue('fillDate');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('dob')).format('DD-MM-YYYY');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('fillDate', moment(val,'DD-MM-YYYY').toDate());
			}
		},
		medication: {
            type: Sequelize.STRING,
            primaryKey: true,
			allowNull:false,
		},
		strength: { 
			type: Sequelize.STRING,
			allowNull:false,
        },
        dosageForm: {
            type: Sequelize.STRING,
			allowNull:false,
        },
        quantity: {
			type: Sequelize.STRING,
			allowNull:false,
		}
	},{
		timestamps:false,
		freezeTableName:true,
	});
}

//Practitioner.hasMany(Document,{foreignKey: 'pracUsername'});