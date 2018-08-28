const Sequelize = require('sequelize');
/*const connection = require('../db/sql-connection')*/
const moment = require('moment');

module.exports = (connection) => {
	return connection.define('User',{
		username: { 
			type: Sequelize.STRING(30),
			primaryKey: true,
			validate: {
				len: {
					args: [6,20],
					msg: 'Please enter username with at least 6 but max 20 characters'
				},
				isAlphanumeric: true
			},
		},
		password: {
			type: Sequelize.STRING(100),
			allowNull: false
		},
		title: {
			type: Sequelize.ENUM('Mr.','Mrs.','Ms.','Dr.','Prof.', 'Miss'),
			allowNull: false
		},
		email: {
			type: Sequelize.STRING(30),
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true
			}
		},
		fName: {
			type: Sequelize.STRING(30),
			allowNull: false
		},
		lName: {
			type: Sequelize.STRING(30),
			allowNull: false
		},
		dob: {
			type: Sequelize.DATEONLY,
			allowNull: false,
			get(){
				let time = this.getDataValue('dob');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('dob')).format('DD-MM-YYYY');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('dob', moment(val,'DD-MM-YYYY').toDate());
			}
		},
		gender: {
			type: Sequelize.ENUM('Male','Female'),
			allowNull: false
		},
		profilePic: {
			type: Sequelize.STRING,
			allowNull:true,
			unique: true
		},
		active:{
			type : Sequelize.BOOLEAN,
			defaultValue : false,
			allowNull : false
		},
		passwordReset: {
			type: Sequelize.STRING(20),
			allowNull: true,
			defaultValue: null
		}
	},{
		timestamps: false,
		freezeTableName: true
	});
}