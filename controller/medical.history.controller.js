var Consultation = require('../model/consultation.model');
var PatientRelation = require('../model/patient.relation.model');
var PatientAllergy = require('../model/patient.allergy.model');

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports = {
    getConsultHistory,
} 

function getConsultHistory(pracUsername, patientUsername) {
	var sql='SELECT Consultation.title as title, Consultation.consultDate as date, Consultation.summary as summary, '
			+ 'Consultation.intervention as intervention, CONCAT(User.title," ",User.fName," ",User.lName) as "by"'
			+ ' FROM Consultation JOIN Practitioner ON Consultation.pracUsername=Practitioner.pracUsername'
			+ ' JOIN User ON Practitioner.pracUsername=User.username'
			+ ' WHERE Consultation.patientUsername=:p';
	return sequelize.query(sql,{replacements: {p: patientUsername},type: Sequelize.QueryTypes.SELECT})
	.then(rows=> {
		console.log(rows);
		return Promise.resolve(rows);
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}