var Specialty = require('../model/specialty.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');

module.exports= {
	createSpecialty
}

function createSpecialty(newSpecialty) {
	return Specialty.findAll({
		atributes: ['pracUsername','degree','institution','specialty'],
		where: {[Op.and]:[
			{pracUsername : newSpecialty.pracUsername},
			{degree : newSpecialty.degree},
			{institution: newSpecialty.institution},
			{specialty:newSpecialty.specialty}
		]
	}})
	.then((foundSpecialties) => {
		if (foundSpecialties.length>0) {
			return Promise.reject({
                    statusCode: 400,
                    message: 'Specialty already existed'
            });
		}
		else {
			return Practitioner.findOne({
				attributes: ['pracUsername'],
				where: {pracUsername: newSpecialty.pracUsername}
			})
			.then ((foundPractictioner) => {
				if (foundPractictioner===null) {
					return Promise.reject({
						statusCode: 400,
						message: 'Practitioner does not exist'
					});
				}
				else {
					console.log('new specialty', newSpecialty);
					return Specialty.create(newSpecialty);
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