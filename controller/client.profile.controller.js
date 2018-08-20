var PatientDoctorRelation = require ('../model/patient.doctor.relation.model');
var Consultation = require('../model/consultation.model');
var Medicine = require('../model/medicine.model');

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
	return PatientDoctorRelation.findAll({ //to confirm that there's a relationship between this patient and this practitioner
		attributes:['pracUsername','patientUsername'],
		where: [
			{pracUsername: consultation.pracUsername},
			{patientUsername: consultation.patientUsername}
		]
	})
	.then(foundRelations=> {
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
				if (consultation.medicines) { //we have some medicines to be inserted into medicine table
					for (var i=0; i< consultation.medicines.length; i++) {
						consultation.medicines[i].pracUsername=consultation.pracUsername;
						consultation.medicines[i].patientUsername=consultation.patientUsername;
						consultation.medicines[i].consultDate=consultation.consultDate;
					}
					return Medicine.bulkCreate(consultation.medicines)
					.then(rows=> {
						delete consultation.medicines;
						console.log('New Consultation: ', consultation);
						return Consultation.create(consultation);
					})
					.catch(err=> {
						console.log(err);
						return Promise.reject({
							statusCode:400,
							message:"An error occur while adding medicines to database"
						});
					})
				}
				else {
					console.log('New Consultation: ', consultation);
					return Consultation.create(consultation);
				}
			}
		})
		.catch(err=> {
			return Promise.reject(err);
		})
	})
	.catch(err=> {
		return Promise.reject(err);
	});
}

function addMedicine(medicine, consultation) {
	return Medicine.findAll({
		attributes: ['pracUsername','patientUsername','consultDate','medication'],
		where: [
			{pracUsername: consultation.pracUsername},
			{patientUsername: consultation.patientUsername},
			{consultDate: consultation.consultDate},
			{medication: medicine.medication}
		]
	})
	.then (foundMedicines => {
		if (foundMedicines.length>0) {
			return Promise.resolve(false);
		}
		else {
			medicine.pracUsername=consultation.pracUsername;
			medicine.patientUsername=consultation.patientUsername;
			medicine.consultDate=consultation.consultDate;
			return Medicine.create(medicine);
		}
	})
	.catch(err => {
		return Promise.reject(err);
	})
}