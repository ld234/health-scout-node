var Qualification = require('../model/qualification.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');

module.exports= {
	createQualification,
	getQualifications
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