/* * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: Handles client medical details
 * Created: 12 Aug 2018
 * Last modified: 2 Sep 2018
 * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Consultation=db.Consultation;
const PatientRelation = db.PatientRelation;
const PatientAllergy = db.PatientAllergy;
const Medication=db.Medication;

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports = {
	getConsultHistory,
	getFamilyHistory,
    getAllergies,
	getMedicationHistory,
} 

function getConsultHistory(patientUsername) {
	var sql='SELECT Consultation.title as title, Consultation.consultDate as date, Consultation.summary as summary, '
			+ 'Consultation.intervention as intervention, CONCAT(User.title," ",User.fName," ",User.lName) as "by",'
			+ ' Practitioner.businessName as businessName, Practitioner.businessAddress as businessAddress'
			+ ' FROM Consultation JOIN Practitioner ON Consultation.pracUsername=Practitioner.pracUsername'
			+ ' JOIN User ON Practitioner.pracUsername=User.username'
			+ ' WHERE Consultation.patientUsername=:p'
			+ ' ORDER BY Consultation.consultDate DESC;';
	return sequelize.query(sql,{replacements: {p: patientUsername},type: Sequelize.QueryTypes.SELECT})
	.then(rows=> {
		return Promise.resolve(rows);
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}

function getFamilyHistory(patientUsername) {
	return PatientRelation.findAll({
		attributes:['familyRelation','familyCondition'],
		where: {patientUsername: patientUsername}
	})
	.then(families=> {
		return Promise.resolve(families);
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}

function getMedicationHistory(patientUsername) {
	return Medication.findAll({
		attributes: {
			excludes: ['patientUsername'],
		},
		where: {patientUsername: patientUsername}
	})
	.then(medications=> {
		return Promise.resolve(medications);
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}

function getAllergies(patientUsername) {
	return PatientAllergy.findAll({
		attributes: ['allergy','symptom'],
		where: {patientUsername: patientUsername}
	})
	.then(allergies=> {
		return Promise.resolve(allergies);
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}