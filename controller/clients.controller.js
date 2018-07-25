var User = require('../model/user.model');
var Practitioner = require('../model/practitioner.model');
var Patient = require('../model/patient.model');
var Consultation = require ('../model/consultation.model');
var PatientDoctorRelation = require ('../model/patient.doctor.relation.model');
var Op = require('sequelize').Op;

module.exports = {
    getClients,
	getNewClients,
	seeNewClient
} 

function getClients(username) {
	return Practitioner.findAll({
		attributes: ['pracUsername'],
		include: [{ //find the Patients corresponds to this practitioner using PatientDoctorRelation table
			model: Patient,
			include: [{
				model: User,
				attributes: ['fName','lName'] //and first and last name of each patient (have to take from user table)
			},{
				model: Consultation,
				attributes: ['consultDate'],
			}],
			through: {
				attributes: ['goal'], //we take the goal attribute from the PatientDoctorRelation table as well
				where: {seen: true} //only take clients which are seen by the practitioner
			},
			required: false //so that if practitioner does not have any patient yet, we still return it, don't ignore
		}],
		where: {pracUsername : username}
	})
	.then(function(foundPractitioners){
		if (foundPractitioners.length==1) {
			for (var i=0; i< foundPractitioners[0].Patients.length; i++) { //for each existing patients
				foundPractitioners[0].Patients[i].Consultations.sort(function(a,b) { //sort consultDate descendingly
					return new Date(b.consultDate) - new Date(a.consultDate);
				});
				foundPractitioners[0].Patients[i].Consultations.length=1; //taking only the latest consultation date by limiting the array length to 1
			}
			return Promise.resolve(foundPractitioners[0]); //we found the practitioner with the full client lists and goals and latest consulations
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner does not exist'
			});
		}
	})
	.catch(function(err){
		return Promise.reject(err);
	})
}

function getNewClients(username) {
	return Practitioner.findAll({
		attributes: ['pracUsername'],
		include: [{ //find the Patients corresponds to this practitioner using PatientDoctorRelation table
			model: Patient,
			include: [{
				model: User,
				attributes: ['fName','lName'] //and first and last name of each patient (have to take from user table)
			}],
			through: {
				attributes: ['message'], //we take the message that patient wants to send to doctor to display
				where: {seen: false} //only take clients which are new (unseen)
			},
			required: false //so that if practitioner does not have any patient yet, we still return it, don't ignore
		}],
		where: {pracUsername : username}
	})
	.then(function(foundPractitioners){
		if (foundPractitioners.length==1) {
			return Promise.resolve(foundPractitioners[0]); //we found the practitioner with the full client lists and goals and latest consulations
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner does not exist'
			});
		}
	})
	.catch(function(err){
		return Promise.reject(err);
	})
}

function seeNewClient(patientUsername,pracUsername) {
	console.log(patientUsername);
	console.log(pracUsername);
	return PatientDoctorRelation.update(
		{
			seen:true
		},
		{where: {
			patientUsername: patientUsername,
			pracUsername: pracUsername,
		}}
	)
	.then(function(rowsUpdated){
		console.log('updated');
		return PatientDoctorRelation.findOne({
			where: {
				patientUsername: patientUsername,
				pracUsername: pracUsername,
			}
		})
		.then(function(updatedClient){
			return Promise.resolve(updatedClient);
		})
		.catch(function(err){
			return Promise.reject(err);
		})
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}