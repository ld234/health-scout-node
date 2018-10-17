/* * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: allow connection between patient and practitioner
 * Created: 13 Aug 2018
 * Last modified: 22 Sep 2018
 * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Practitioner = db.Practitioner;
const PatientDoctorRelation = db.PatientDoctorRelation;
const paymentController = require('./payment.controller');

module.exports= {
	connectWithPrac,
}

function connectWithPrac(connectInfo) {
	return Practitioner.findOne({
		where: {pracUsername: connectInfo.pracUsername}
	})
	.then(foundPrac=>{
		if(!foundPrac) {
			return Promise.reject({
				statusCode:404,
				message: 'Practitioner not found'
			})
		}
		else {
			return PatientDoctorRelation.findOne({
				where: [
					{pracUsername: connectInfo.pracUsername},
					{patientUsername: connectInfo.patientUsername}
				]
			})
			.then(foundRelation=>{
				if (foundRelation) {
					return Promise.reject({
						statusCode:400,
						message: 'You already connected with this practitioner'
					})
				}
				else {
					return paymentController.patientCharge(connectInfo.patientUsername,connectInfo.stripeToken)
					.then(charge=>{
						delete connectInfo.stripeToken;
						return PatientDoctorRelation.create(connectInfo);
					})
					.catch(err=>{
						return Promise.reject(err);
					})
				}
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}