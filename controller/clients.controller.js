var User = require('../model/user.model');
var Practitioner = require('../model/practitioner.model');
var Patient = require('../model/patient.model');
var Consultation = require ('../model/consultation.model');
var PatientDoctorRelation = require ('../model/patient.doctor.relation.model');

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports = {
    getClients,
	getNewClients,
	seeNewClient,
	//searchClients
} 

/*function getClients(username) {
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
}*/

function getClients(username) {
	var sql = `SELECT PatientDoctorRelation.pracUsername AS pracUsername, 
				PatientDoctorRelation.patientUsername AS patientUsername, PatientDoctorRelation.seen AS seen,
				PatientDoctorRelation.goal AS goal, PatientDoctorRelation.conditions AS conditions,
				PatientDoctorRelation.testimonial AS testimonial, PatientDoctorRelation.rating AS rating,
				User.profilePic as profilePic,
				User.title as title,
				User.fName AS fName, User.lName AS lName, User.dob AS dob,
				PatientDoctorRelation.goal AS goal, MAX(Consultation.consultDate) AS lastConsultation
				FROM PatientDoctorRelation JOIN User ON PatientDoctorRelation.patientUsername=User.username
					LEFT OUTER JOIN Consultation ON PatientDoctorRelation.patientUsername=Consultation.patientUsername AND PatientDoctorRelation.pracUsername=Consultation.pracUsername
				GROUP BY PatientDoctorRelation.pracUsername, PatientDoctorRelation.patientUsername
				HAVING PatientDoctorRelation.pracUsername= :u AND seen=true;`
	return sequelize.query(sql, {replacements: {u: username}, type: Sequelize.QueryTypes.SELECT})
		.then(rows=> {
			return Promise.resolve(rows);
		})
		.catch(err=>{
			return Promise.reject(err);
		});
}

function getNewClients(username) {
	var sql = `SELECT PatientDoctorRelation.pracUsername AS pracUsername, 
	PatientDoctorRelation.patientUsername AS patientUsername, PatientDoctorRelation.seen AS seen,
	PatientDoctorRelation.goal AS goal, PatientDoctorRelation.conditions AS conditions,
	PatientDoctorRelation.testimonial AS testimonial, PatientDoctorRelation.rating AS rating,
	User.profilePic as profilePic,
	User.title as title,
	User.fName AS fName, User.lName AS lName, User.dob AS dob,
	PatientDoctorRelation.goal AS goal, MAX(Consultation.consultDate) AS lastConsultation
	FROM PatientDoctorRelation JOIN User ON PatientDoctorRelation.patientUsername=User.username
		LEFT OUTER JOIN Consultation ON PatientDoctorRelation.patientUsername=Consultation.patientUsername AND PatientDoctorRelation.pracUsername=Consultation.pracUsername
	GROUP BY PatientDoctorRelation.pracUsername, PatientDoctorRelation.patientUsername
	HAVING PatientDoctorRelation.pracUsername= :u AND seen=false;`;
	return sequelize.query(sql, {replacements: {u: username}, type: Sequelize.QueryTypes.SELECT})
		.then(rows=> {
			return Promise.resolve(rows);
		})
		.catch(err=>{
			return Promise.reject(err);
		});
}

/*function getNewClients(username) {
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
}*/

function seeNewClient(patientUsername,pracUsername) {
	return PatientDoctorRelation.findOne({
		where: {
			patientUsername: patientUsername,
			pracUsername: pracUsername,
		}
	})
	.then(found => {
		if (found){
			return PatientDoctorRelation.update(
				{
					seen:true
				},
				{ where: {
					patientUsername: patientUsername,
					pracUsername: pracUsername,
				}
			})
			.then(function(rowsUpdated){
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
		} else{ 
			return Promise.reject({
				statusCode: 400,
				message: "No practitioner or patient found."
			})
		}
	})
	.catch( err => Promise.reject(err));
	
}

/*function searchClients(pracUsername,patientName) {
	var names=patientName.split(" "); //names[0] is first name and names[1] is last name
	return Practitioner.findAll({
		attributes:['pracUsername'],
		include: [{ //find the Patients corresponds to this practitioner using PatientDoctorRelation table
			model: Patient,
			include: [{
				model: User,
				attributes: ['fName','lName'], //and first and last name of each patient (have to take from user table)
				where: {fName:names[0], lName: names[1]}
			},{
				model: Consultation,
				attributes: ['consultDate'],
				required: false
			}],
			through: {
				attributes: ['message','goal','seen'], //we take the message that patient wants to send to doctor to display
			},
			required: false //so that if practitioner does not have any patient yet, we still return it, don't ignore
		}],
		where: {pracUsername : pracUsername}
	})
	.then(function(foundPractitioners){
		if (foundPractitioners.length==1) {
			for (var i=0; i< foundPractitioners[0].Patients.length; i++) { //for each existing patients
				if (foundPractitioners[0].Patients[i].Consultations.length>1) { //only if the patient is seen and have some consultations with the practitioner
					foundPractitioners[0].Patients[i].Consultations.sort(function(a,b) { //sort consultDate descendingly
						return new Date(b.consultDate) - new Date(a.consultDate);
					});
					foundPractitioners[0].Patients[i].Consultations.length=1; //taking only the latest consultation date by limiting the array length to 1
				}
			}
			return Promise.resolve(foundPractitioners[0]); //we found the practitioner with the full client lists and goals and latest consulations
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner does not exist'
			})
		}
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}*/