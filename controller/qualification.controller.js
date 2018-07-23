var Qualification = require('../model/qualification.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');

module.exports= {
	createQualification,
	getQualifications,
	updateQualification,
	deleteQualification
}

function createQualification(newQualification) {
	return Qualification.findAll({
		atributes: ['pracUsername','degree','institution','graduateYear'],
		where: {[Op.and]:[
			{pracUsername : newQualification.pracUsername},
			{degree : newQualification.degree},
			{institution: newQualification.institution},
			{graduateYear:newQualification.graduateYear}
		]
	}})
	.then((foundQualifications) => {
		if (foundQualifications.length>0) {
			return Promise.reject({
				statusCode: 400,
				message: 'Qualification already existed'
            });
		}
		else {
			return Practitioner.findOne({
				attributes: ['pracUsername'],
				where: {pracUsername: newQualification.pracUsername}
			})
			.then ((foundPractictioner) => {
				if (foundPractictioner===null) {
					return Promise.reject({
						statusCode: 400,
						message: 'Practitioner does not exist'
					});
				}
				else {
					console.log('new Qualification', newQualification);
					return Qualification.create(newQualification);
				}
			})
			.catch(function(err) {
				return Promise.reject(err);
			})
		}
	})
	.catch(function(err) {
		return Promise.reject(err);
	})
}

function getQualifications(username){
	return Qualification.findAll({
		where: {
			pracUsername: username
		},
		order: [
			['graduateYear', 'DESC']
		],})
	.then(qualifications => {
		return Promise.resolve(qualifications);
	})
	.catch(err => Promise.reject(err));
}

function deleteQualification(deletedQualification) {
	return Practitioner.findAll({
		attributes: ['pracUsername'],
		where: {pracUsername: deletedQualification.pracUsername}
	})
	.then(function(foundPractitioners){
		if (foundPractitioners.length>0) {
			return Qualification.destroy({where: [
				{pracUsername : deletedQualification.pracUsername},
				{degree : deletedQualification.degree},
				{institution : deletedQualification.institution},
				{graduateYear : deletedQualification.graduateYear}
			]})
			.then (function(numOfDestroyed){
				if (numOfDestroyed==1) {
					return Promise.resolve('qualiication deleted successfully');
				}
				else {
					return Promise.reject({
						statusCode:404, //should be changed to 204 NO CONTENT (no response body) when deployed
						message: 'Qualification does not exist'
					})
				}
			})
			.catch(err => {
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message:'Practitioner not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function updateQualification(updatedQualification) {
	return Practitioner.findAll({
		attributes: ['pracUsername'],
		where: {pracUsername: updatedQualification.pracUsername}
	})
	.then(function(foundPractitioners){
		if (foundPractitioners.length>0) {
			console.log(updatedQualification);
			return Qualification.update(
				{
					degree: updatedQualification.newDegree,
					institution: updatedQualification.newInstitution,
					graduateYear : updatedQualification.newGraduateYear,
					description : updatedQualification.description
				},
				{where: {
					pracUsername : updatedQualification.pracUsername,
					degree : updatedQualification.oldDegree,
					institution : updatedQualification.oldInstitution,
					graduateYear : updatedQualification.oldGraduateYear
				}}
			)
			.then(function(updatedArray){
				console.log(updatedArray[0]);
				if (updatedArray[0]==1) {
					return Promise.resolve("updated successfully");
				}
				else {
					return Promise.reject({
						statusCode:404,
						message: 'Old qualification not found/ New qualification exactly the same'
					})
				}
			})
			.catch(function(err){ //if the updated qualification already exists, jump here
				return Promise.reject({
					statusCode:404,
					message: 'Updated qualification already exists'
				});
				//return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
	})
	.catch(function(err){
		return Promise.reject(err);
	})
}