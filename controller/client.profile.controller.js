const db = require('../utils/create.db');
const PatientDoctorRelation = db.PatientDoctorRelation;
const Consultation= db.Consultation;

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports = {
	viewClientProfile,
	addConsultation,
	getConsultations,
}

function viewClientProfile(patientUsername,pracUsername) {
	return PatientDoctorRelation.findOne({ //to confirm that there's a relationship between this patient and this practitioner
		attributes:['pracUsername','patientUsername','seen'],
		where: [
			{pracUsername: pracUsername},
			{patientUsername: patientUsername}
		]
	})
	.then(foundRelation => { //found does not mean it's not null
		console.log(foundRelation);
		if (foundRelation) {
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
				if (rowsUpdated==1) { //if rowsUpdated=0, mean the update operation is successful, just no row updated,suggesting seen=true from the beginning
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
						return Promise.reject({
							statusCode:404,
							message: 'Client not found/ Multiple clients found'
						})
					}
				})
				.catch(function(err){
					return Promise.reject(err);
				})
			})
			.catch(err=> { //update operation failed, meaning the practitioner has run out of available connections
				return Promise.reject(err); //the error run of of connection raised from database
			})
		}
		else { //foundRelation is null
			return Promise.reject({
				statusCode:404,
				message:'No relation found between practitioner and patient'
			})
		}
	})
	.catch(err=> { //catch all errors that are not caught from the then block down here
		return Promise.reject(err);
	})
}

function addConsultation(consultation) {
	return PatientDoctorRelation.findOne({ //to confirm that there's a relationship between this patient and this practitioner, and THE DOCTOR HAVE SEEN THE PATIENT
		attributes:['pracUsername','patientUsername'],
		where: [
			{pracUsername: consultation.pracUsername},
			{patientUsername: consultation.patientUsername},
			{seen:true}
		]
	})
	.then(foundRelation=> {
		if (foundRelation) {
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
					console.log('New Consultation: ', consultation);
					return Consultation.create(consultation);
				}
			})
			.catch(err=> {
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message:'Practitioner have not seen/ does not have a connection with the patient'
			})
		}
	})
	.catch(err=> {
		return Promise.reject(err);
	});
}

function getConsultations(patientUsername) {
	var sql='SELECT Consultation.title as title, Consultation.consultDate as date, Consultation.summary as summary, '
			+ 'Consultation.intervention as intervention, CONCAT(User.title," ",User.fName," ",User.lName) as "by",'
			+ ' Practitioner.pracType, Practitioner.businessName, Practitioner.businessAddress'
			+ ' FROM Consultation JOIN Practitioner ON Consultation.pracUsername=Practitioner.pracUsername'
			+ ' JOIN User ON Practitioner.pracUsername=User.username '
			+ ' WHERE Consultation.patientUsername=:p'
			+ ' ORDER BY Consultation.consultDate DESC;';
	return sequelize.query(sql,{replacements: {p:patientUsername},type: Sequelize.QueryTypes.SELECT})
	.then(rows=> {
		console.log(rows);
		return Promise.resolve(rows);
	})
	.catch(err=> {
		console.log(err);
		return Promise.reject(err);
	})
}