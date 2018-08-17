var PatientDoctorRelation = require ('../model/patient.doctor.relation.model');
var Consultation = require('../model/consultation.model');

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports = {
	viewClientProfile,
	addConsultation,
}

function viewClientProfile(patientUsername,pracUsername) {
	return PatientDoctorRelation.update( //update seen to true for patientUsername and pracUsername if their current relationship is false
		{
			seen:true
		},
		{where: {
			patientUsername: patientUsername,
			pracUsername: pracUsername,
			seen:false
		}}
	)
	.then(function(rowsUpdated){
		if (rowsUpdated==1) {
			console.log('Practitioner have seen the new patient');
		}
		var sql='SELECT username, CONCAT(title," ",fName," ",lName) AS name, TIMESTAMPDIFF(YEAR,dob,CURDATE()) AS age FROM User '
				+ 'JOIN PatientDoctorRelation ON User.username=PatientDoctorRelation.patientUsername '
				+ 'WHERE PatientDoctorRelation.pracUsername=? AND PatientDoctorRelation.patientUsername=?';
		return sequelize.query(sql, {replacements: [pracUsername,patientUsername], type: Sequelize.QueryTypes.SELECT})
		.then(function(rows){
			if (rows.length==1) {
				return Promise.resolve(rows[0]);
			}
			else {
				return Pormise.reject({
					statusCode:404,
					message: 'Client not found/ Multiple clients found'
				})
			}
		})
		.catch(function(err){
			return Promise.reject(err);
		})
	})
	.catch(err=> {
		return Promise.reject({
			statusCode:404,
			message: 'Cannot find the relation between practitioner: '+pracUsername+' and patient: '+patientUsername
		});
	})
}

function addConsultation(consultation) {
	return Consultation.findAll({
		attributes: ['pracUsername','patientUsername','consultDate'],
		where: [
			{pracUsername: consultation.pracUsername},
			{patientUsername: consultation.patientUsername},
			{consultDate: consultation.consultDate}
		]
	})
	.then(foundConsultations => {
		if (foundConsultations.length>0) {
			return Promise.reject({
				statusCode:400,
				message: 'Consultation already exists'
			})
		}
		else {
			if (consultation.medicines.length>0) { //we have some medicines to be inserted into medicine table
				for (var i=0; i< consultation.medicines.length; i++) {
					
				}
			}
		}
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}