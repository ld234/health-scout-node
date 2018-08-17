var Qualification = require('../model/qualification.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');

module.exports= {
	createQualification,
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
			console.log('new Qualification', newQualification);
			return Qualification.create(newQualification);
		}
	})
	.catch(function(err) {
		return Promise.reject(err);
	})
}

function deleteQualification(deletedQualification) {
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

function updateQualification(updatedQualification) {
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
		if (updatedArray[0]==1) { //exactly 1 row updated which is what we want
			return Promise.resolve({
				updated: updatedQualification,
				message: 'updated successfully'
			});
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'strange behavior.No row is updated or multiple rows updated'
			})
		}
	})
	.catch(function(err){ //if the old qualification not found, or if updated qualification exactly the same, or if updated qualification already exists
		return Promise.reject({
			statusCode:404,
			message: 'Old qualification not found/Updated qualification already exists'
		});
	})
}