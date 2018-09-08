const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (connection) => {
	return connection.define('Document',{
		pracUsername: {
			type: Sequelize.STRING,
			primaryKey: true,
			validate: {
				isAlphanumeric: true
			},
		},
		title: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		description: {
			type: Sequelize.STRING,
			allowNull:true,
		},
		file: { //the path to the file. We allow the practitioner to upload the same file in different document, only the title need to be unique
			type: Sequelize.STRING,
			allowNull:false,
		},
		lastModified: {
			type: Sequelize.DATE,
			allowNull:false,
			get(){
				let time = this.getDataValue('lastModified');
				if (moment(time,moment.ISO_8601,true).isValid()){
					return moment.utc(this.getDataValue('lastModified')).format('DD-MM-YYYY HH:mm:ss');
				}
				else{
					return time;
				}
			},
			set(val) {
				this.setDataValue('lastModified', moment.utc(val,'DD-MM-YYYY HH:mm:ss').toDate());
			}
		}
	},{
		timestamps:false,
		freezeTableName:true,
	});
}