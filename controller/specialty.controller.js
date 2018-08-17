var Specialty = require('../model/specialty.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');

module.exports= {
	createSpecialty,
	deleteSpecialty
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
			console.log('new specialty', newSpecialty);
			return Specialty.create(newSpecialty);
		}
	})
	.catch(function(err) {
		return Promise.reject(err);
	})
}

function deleteSpecialty(deletedSpecialty) {
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