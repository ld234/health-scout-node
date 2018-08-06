var Specialty = require('../model/specialty.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');
var PracTypeSpecialty = require('../model/practype.specialty.model');

module.exports= {
	createSpecialty,
	deleteSpecialty,
	getSpecialties,
	getAvailableSpecialties
}

function getSpecialties(username) {
	return Specialty.findAll ({
		where:{pracUsername: username}
	})
	.then(foundSpecialties => {
		console.log(foundSpecialties);
		return Promise.resolve(foundSpecialties);
	})
	.catch( err => Promise.reject(err));
}

function getAvailableSpecialties(pracType){
	return PracTypeSpecialty.findAll ({
		where:{pracType: pracType}
	})
	.then(foundSpecialties => {
		console.log(foundSpecialties);
		return Promise.resolve(foundSpecialties);
	})
	.catch( err => Promise.reject(err));
}

function createSpecialty(newSpecialty) {
	return Specialty.findAll({
		atributes: ['pracUsername','specialty'],
		where: {[Op.and]:[
			{pracUsername : newSpecialty.pracUsername},
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

function deleteSpecialty(deletedSpecialty) {
	return Practitioner.findAll({
		attributes: ['pracUsername'],
		where: {pracUsername: deletedSpecialty.pracUsername}
	})
	.then(function(foundPractitioners){
		if (foundPractitioners.length>0) {
			return Specialty.destroy({where:[{pracUsername: deletedSpecialty.pracUsername},{specialty: deletedSpecialty.specialty}]})
			.then (function(numOfDestroyed){
				if (numOfDestroyed==1) {
					return Promise.resolve('specialty deleted successfully');
				}
				else {
					return Promise.reject({
						statusCode:404, //should be changed to 204 NO CONTENT (and no response body) when deployed
						message: 'Specialty does not exist'
					})
				}
			})
			.catch(err => {
				return Promise.reject(err);
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}