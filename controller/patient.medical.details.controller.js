/* * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: Client profile controller handling viewing, updating profile of client
 * Created: 13 Aug 2018
 * Last modified: 30 Sep 2018
 * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Patient = db.Patient;
const PatientRelation = db.PatientRelation;
const PatientAllergy = db.PatientAllergy;
const Medication=db.Medication;
const Consultation = db.Consultation;
const Practitioner= db.Practitioner;
const User = db.User;

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports={
	addAllergy,
	deleteAllergy,
	addFamilyHistory,
	deleteFamilyHistory,
	addMedication,
	deleteMedication,
	getAllergy,
	getFamilyHistory,
	getMedication,
	getConsultation
}

function addAllergy(patientAllergy) {
	return PatientAllergy.findOne({
		where: [
			{allergy: patientAllergy.allergy},
			{patientUsername: patientAllergy.patientUsername},
		]
	})
	.then(foundAllergy=>{
		if (foundAllergy) {
			return Promise.reject({
				statusCode:400,
				message: 'Patient allergy already exists'
			})
		}
		else {
			return PatientAllergy.create(patientAllergy);
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function addFamilyHistory(patientRelation) {
	return PatientRelation.findOne({
		where: [
			{familyRelation: patientRelation.familyRelation},
			{patientUsername: patientRelation.patientUsername},
		]
	})
	.then(foundRelation=>{
		if (foundRelation) {
			return Promise.reject({
				statusCode:400,
				message: 'Patient relation already exists'
			})
		}
		else {
			return PatientRelation.create(patientRelation);
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function addMedication(patientMedication) {
	return Medication.findOne({
		where: [
			{fillDate: patientMedication.fillDate},
			{medication: patientMedication.medication},
			{patientUsername: patientMedication.patientUsername},
		]
	})
	.then(foundMedication=>{
		if (foundMedication) {
			return Promise.reject({
				statusCode:400,
				message: 'Patient medication already exists'
			})
		}
		else {
			return Medication.create(patientMedication);
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function deleteAllergy(delAllergy) {
	return PatientAllergy.destroy({
		where: [
			{patientUsername: delAllergy.patientUsername},
			{allergy: delAllergy.allergy}
		]
	})
	.then(numOfDestroyed=>{
		if (numOfDestroyed==1) {
			return Promise.resolve('allergy deleted successfully');
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Allery does not exist'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function deleteFamilyHistory(delRelation) {
	return PatientRelation.destroy({
		where: [
			{patientUsername: delRelation.patientUsername},
			{familyRelation: delRelation.familyRelation}
		]
	})
	.then(numOfDestroyed=>{
		if (numOfDestroyed==1) {
			return Promise.resolve('Family history deleted successfully');
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Family relation does not exist'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function deleteMedication(delMedication) {
	return Medication.destroy({
		where: [
			{patientUsername: delMedication.patientUsername},
			{fillDate: delMedication.fillDate},
			{medication: delMedication.medication}
		]
	})
	.then(numOfDestroyed=>{
		if (numOfDestroyed==1) {
			return Promise.resolve('medication deleted successfully');
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'medication does not exist'
			})
		}
	})
	.catch(err=>{
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

function getMedication(patientUsername) {
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

function getAllergy(patientUsername) {
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

function getConsultation(patientUsername) {
	var sql = 'select c.*,c.title,u.title as pracTitle, u.fName,u.lName,p.pracType '
			+ 'from Consultation c join Practitioner p on c.pracUsername=p.pracUsername '
			+ 'join User u on p.pracUsername=u.username '
			+ 'where c.patientUsername=? '
			+ 'order by c.consultDate DESC;';		
	return sequelize.query(sql,{replacements:[patientUsername],type:Sequelize.QueryTypes.SELECT})
	.then(consultList=>{
		return Promise.resolve(consultList);
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}