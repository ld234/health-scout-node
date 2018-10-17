/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: Handles create, get, update, and delete of qualifications
 * Created: 29 Jul 2018
 * Last modified: 26 Aug 2018
 * * * * * * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Qualification= db.Qualification;
const Practitioner=db.Practitioner;

var Op = require('sequelize').Op;
var authController = require('./auth.controller');


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
			return Qualification.create(newQualification);
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
	return Qualification.findAll({
		attributes: ['pracUsername'],
		where: {
			pracUsername: updatedQualification.pracUsername,
			degree: updatedQualification.oldDegree,
			institution: updatedQualification.oldInstitution,
			graduateYear : updatedQualification.oldGraduateYear
		}
	})
	.then(function(foundQualifications){
		if (foundQualifications.length>0) {
			return Qualification.update(
				{
					degree: updatedQualification.newDegree,
					institution: updatedQualification.newInstitution,
					graduateYear : updatedQualification.newGraduateYear,
					description : updatedQualification.description
				},
				{ where: {
					pracUsername : updatedQualification.pracUsername,
					degree : updatedQualification.oldDegree,
					institution : updatedQualification.oldInstitution,
					graduateYear : updatedQualification.oldGraduateYear
				}}
			)
			.then(function(updatedArray){
				if (updatedArray[0]==1) { //exactly one row gets updated
					let { newDegree, newInstitution, newGraduateYear, description} = updatedQualification;
					return Promise.resolve({ 
						qualification: {
							degree: newDegree, 
							institution: newInstitution, 
							graduateYear: newGraduateYear, 
							description: description
					}});
				}
				else {
					return Promise.reject({
						statusCode:404,
						message: 'Strange behavior. No row updated or multiple rows updated'
					})
				}
			})
			.catch(function(err){ //if the updated qualification already exists (including being the same with the old qualification, because the old already exists)
				return Promise.reject({
					statusCode:404,
					message: 'Updated qualification already exists'
				});
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Qualification not found'
			})
		}
	})
	.catch(function(err){ //this blocks basically catches any errors that might happen above: old not found, new exists, or new exactly the same with old
		return Promise.reject(err);
	})
}