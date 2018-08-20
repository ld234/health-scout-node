var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var clientProfileController = require('../controller/client.profile.controller');

module.exports = router;

router.get('/',auth.auth(),auth.pracAuth(),viewClientProfile);
router.post('/consultation',auth.auth(),auth.pracAuth(),addConsultation)

function viewClientProfile(req,res,next) { //practitioner click on a client to see his or her profile.Change status seen to true in PatientDoctorRelation (if not already is)
	var patientUsername= req.query.patientUsername;
	var pracUsername=req.user;
	clientProfileController.viewClientProfile(patientUsername,pracUsername)
		.then(function(client){
			res.send({
				statusCode:200,
				message: client
			});
		})
		.catch(err=>{
			next(err);
		})
}

function addConsultation(req,res,next) {
	var consultation=req.body;
	consultation.pracUsername=req.user;
	if (!consultation.patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else if (!consultation.consultDate) {
		next({
			statusCode:400,
			message: 'Consultation date is required'
		})
	}
	else if (!consultation.title) {
		next({
			statusCode:400,
			message: 'Consultation title is required'
		})
	}
	else if (consultation.medicines) { //if the practitioner gives some medicines to the patient
		var missingMedication=false;
		for (var i=0; i< consultation.medicines.length; i++) {
			if (!consultation.medicines[i].medication) { //if the name of the medicine is lack
				missingMedication=true;
				break;
			}
		}
		if (missingMedication) {
			next({
				statusCode:400,
				message: 'Medication name is required'
			});
		}
	}
	clientProfileController.addConsultation(consultation)
	.then(newConsultation=> {
		res.status(200).send(newConsultation);
	})
	.catch(err=> {
		next(err);
	})
}