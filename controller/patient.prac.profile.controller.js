const db = require('../utils/create.db');
const User=db.User;
const Patient=db.Patient;
const Practitioner = db.Practitioner;
const PatientDoctorRelation = db.PatientDoctorRelation;
const Specialty = db.Specialty;
const Qualification = db.Qualification;

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports= {
	getSpecialty,
	getQualification,
	getGeneralInfo,
	getTestimonial,
	addTestimonial,
	viewPracProfile,
}

function getSpecialty(pracUsername) {
	return Practitioner.findOne({
		where:{pracUsername:pracUsername}
	})
	.then(foundPrac=>{
		if (foundPrac) {
			return Specialty.findAll({
				where: {pracUsername:pracUsername}
			})
			.then(specialtyList=>{
				return Promise.resolve(specialtyList);
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function getQualification(pracUsername) {
	return Practitioner.findOne({
		where:{pracUsername:pracUsername}
	})
	.then(foundPrac=>{
		if (foundPrac) {
			return Qualification.findAll({
				where: {pracUsername:pracUsername}
			})
			.then(qualificationList=>{
				return Promise.resolve(qualificationList);
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function getGeneralInfo(pracUsername) {
	return Practitioner.findOne({
		where:{pracUsername:pracUsername}
	})
	.then(foundPrac=>{
		if (foundPrac) {
			return Practitioner.findAll({
				attributes: ['pracUsername','pracType','serviceProvided','rating','description','viewsToday'],
				include: [{
					model: User,
					attributes: ['title','fName','lName']
				}],
				where: {pracUsername:pracUsername}
			})
			.then(generalInfo=>{
				return Promise.resolve(generalInfo);
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function getTestimonial(pracUsername) {
	return Practitioner.findOne({
		where:{pracUsername:pracUsername}
	})
	.then(foundPrac=>{
		if (foundPrac) {
			/*return PatientDoctorRelation.findAll({
				attributes: ['patientUsername','testimonial','rating'],
				include: [{
					model:Patient,
					attributes: ['patientUsername'],
					include: [{
						model:User,
						attributes: ['title','fName','lName']
					}]
				}],
				where: {pracUsername:pracUsername}
			})*/
			var sql= 'select u.title,u.fName,u.lName,p.patientUsername,pdr.testimonial,pdr.rating '
					+'from User u join Patient p on u.username=p.patientUsername '
					+'join PatientDoctorRelation pdr on p.patientUsername=pdr.patientUsername '
					+'where pdr.pracUsername=? and pdr.rating is not null';
			return sequelize.query(sql,{replacements:[pracUsername],type: Sequelize.QueryTypes.SELECT})
			.then(testimonialList=>{
				return Promise.resolve(testimonialList);
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function addTestimonial(review) {
	return Practitioner.findOne({
		where:{pracUsername:review.pracUsername}
	})
	.then(foundPrac=>{
		if (foundPrac) {
			return PatientDoctorRelation.findOne({
				where: [
					{pracUsername:review.pracUsername},
					{patientUsername:review.patientUsername}
				]
			})
			.then(foundRelation=>{
				if (foundRelation) {
					return PatientDoctorRelation.update({
						testimonial:review.testimonial,
						rating: review.rating
					},{
						where: {
							pracUsername: review.pracUsername,
							patientUsername:review.patientUsername
						}
					})
					.then(updatedArray=>{
						return Promise.resolve({
							testimonial: {
								pracUsername: review.pracUsername,
								by: review.patientUsername,
								testimonial: review.testimonial,
								rating: review.rating
							}
						});
					})
					.catch(err=>{
						return Promise.reject(err);
					})
				}
				else {
					return Promise.reject({
						statusCode:404,
						message: 'Relation does not exist'
					})
				}
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function viewPracProfile(pracUsername) {
	return Practitioner.findOne({
		where:{pracUsername:pracUsername}
	})
	.then(foundPrac=>{
		if (foundPrac) {
			return Practitioner.update({
				viewsToday: sequelize.literal('viewsToday+1')
			},{
				where: {pracUsername:pracUsername}
			})
			.then(updatedArray=>{
				/*return Practitioner.findOne({
					attributes: ['pracUsername','viewsToday'],
					where: {pracUsername:pracUsername}
				});*/
				let prac={};
				prac.pracUsername=foundPrac.pracUsername;
				prac.viewsToday=++foundPrac.viewsToday;
				return Promise.resolve(prac);
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}