const db = require('../utils/create.db');
const User = db.User;
const Practitioner = db.Practitioner;
const Patient = db.Patient;
const Consultation=db.Consultation;
const PatientDoctorRelation=db.PatientDoctorRelation;

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

function getClients(username) {
	/*
		we need to do a LEFT OUTER JOIN with Consultation because it might happen that patientUsername and pracUsername appears in PatientDoctorRelation,
		their relationship is "seen=true", but they don't have any consultations yet, but we still want to show that patient as an existing patient, because
		the practitioner has clicked on that patient's profile
	*/
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
	PatientDoctorRelation.message AS message,
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

function seeNewClient(patientUsername,pracUsername) {
	console.log('see new client');
	return PatientDoctorRelation.update(
		{
			seen:true,
			rating: null,
		},
		{
			where: {
				patientUsername: patientUsername,
				pracUsername: pracUsername,
				seen: false
			}
		})
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