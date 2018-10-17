/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: Handles create, get, update, and delete of specialties
 * Created: 30 Jul 2018
 * Last modified: 10 Sep 2018
 * * * * * * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Specialty = db.Specialty;
const Practitioner=db.Practitioner;
const PracTypeSpecialty=db.PracTypeSpecialty;

var Op = require('sequelize').Op;
var authController = require('./auth.controller');

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
		return Promise.resolve(foundSpecialties);
	})
	.catch( err => Promise.reject(err));
}

function getAvailableSpecialties(pracType){
	return PracTypeSpecialty.findAll ({
		where:{pracType: pracType}
	})
	.then(foundSpecialties => {
		return Promise.resolve(foundSpecialties);
	})
	.catch( err => Promise.reject(err));
}

function createSpecialty(newSpecialty) {
	return PracTypeSpecialty.findAll( {where: {specialtyName: newSpecialty.specialty} })
	.then(foundSpecialties => {
		if (foundSpecialties.length == 0) {
			return Promise.reject({
				statusCode: 400,
				message: 'Specialty does not exist'
            });
		}
		else {
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
					return Specialty.create(newSpecialty);
				}
			})
		}
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