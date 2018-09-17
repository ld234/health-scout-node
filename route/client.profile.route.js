var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var clientProfileController = require('../controller/client.profile.controller');
var medicalDetailsRouter = require('../route/medical.details.route');
var exchangeDocumentRouter = require('../route/exchange.document.route');

module.exports = router;

router.put('/',auth.auth(),auth.pracAuth(),viewClientProfile);
router.post('/consultation',auth.auth(),auth.pracAuth(),addConsultation);
router.get('/consultation',auth.auth(),auth.pracAuth(),getConsultations); //get the consultation history by the me (the current practitioner only)
router.put('/consultation',auth.auth(),auth.pracAuth(),updateConsultation);
router.get('/consultation',auth.auth(),auth.pracAuth(),getConsultations); //get all of patient's consultation history
router.use('/medicalDetails',auth.auth(),auth.pracAuth(),medicalDetailsRouter); //redirect medical history to medicalHistoryRouter
router.use('/exchangeDocument',auth.auth(),auth.pracAuth(),exchangeDocumentRouter);

function viewClientProfile(req,res,next) { //practitioner click on a client to see his or her profile.Change status seen to true in PatientDoctorRelation (if not already is)
	var patientUsername= req.body.patientUsername;
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
	else {
		clientProfileController.addConsultation(consultation)
		.then(newConsultation=> {
			res.status(200).send(newConsultation);
		})
		.catch(err=> {
			next(err);
		})
	}
}

function getConsultations(req,res,next) {
	var patientUsername = req.query.patientUsername;
	var pracUsername= req.user;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		clientProfileController.getConsultations(pracUsername,patientUsername)
		.then(consultations => res.status(200).send(consultations))
		.catch( err => next(err));
	}
}

function updateConsultation(req,res,next) {
	var updatedConsultation = req.body;
	updatedConsultation.pracUsername=req.user;
	if (!updatedConsultation.patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else if (!updatedConsultation.oldConsultDate) {
		next({
			statusCode:400,
			message: 'Old Consult Date is required'
		})
	}
	else if (!updatedConsultation.newConsultDate) {
		next({
			statusCode:400,
			message: 'New Consult Date is required'
		})
	}
	else {
		clientProfileController.updateConsultation(updatedConsultation)
		.then(consultation=>{
			res.status(201).send(consultation);
		})
		.catch(err=>{
			next(err);
		})
	}
}