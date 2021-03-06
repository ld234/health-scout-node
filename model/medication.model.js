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
				/*len: {
					args: [8,30],
					msg: 'Please enter username with at lease 8 but max 30 characters'
				},*/
				isAlphanumeric: true
			},
		},
		fillDate: {
			type: Sequelize.DATEONLY,
            primaryKey: true,
            get(){
				let time = this.getDataValue('fillDate');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('fillDate')).format('DD-MM-YYYY');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('fillDate', moment.utc(val,'DD-MM-YYYY').toDate());
			}
		},
		medication: {
            type: Sequelize.STRING,
            primaryKey: true,
			allowNull: true,
		},
		strength: { 
			type: Sequelize.STRING,
			allowNull: true,
        },
        dosageForm: {
            type: Sequelize.STRING,
			allowNull: true,
        },
        quantity: {
			type: Sequelize.INTEGER,
			allowNull: true,
		}
	},{
		timestamps:false,
		freezeTableName:true,
	});
}

//Practitioner.hasMany(Document,{foreignKey: 'pracUsername'});