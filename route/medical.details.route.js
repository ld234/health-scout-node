var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var medicalHistoryController = require('../controller/medical.details.controller');
module.exports = router;

router.get('/consultHistory',auth.auth(),auth.pracAuth(),getConsultHistory); //get all consultations of patient from every practitioner
router.get('/allergies',auth.auth(),auth.pracAuth(),getAllergies);
router.get('/familyHistory',auth.auth(),auth.pracAuth(),getFamilyHistory);
router.get('/medicationHistory',auth.auth(),auth.pracAuth(),getMedicationHistory);

function getConsultHistory(req,res,next) {
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalDetailsController.getConsultHistory(patientUsername)
		.then(consultList => {
			res.send({
				statusCode:200,
				message: consultList
			});
		})
		.catch(err=> {
			next(err);
		})
	}
}

function getFamilyHistory(req,res,next) {
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalDetailsController.getFamilyHistory(patientUsername)
		.then(familyList => {
			res.send({
				statusCode:200,
				message: familyList
			});
		})
		.catch(err=> {
			next(err);
		})
	}
}

function getMedicationHistory(req,res,next) {
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalHistoryController.getMedicationHistory(patientUsername)
		.then(medicationList => {
			res.send({
				statusCode:200,
				message: medicationList
			});
		})
		.catch(err=> {
			next(err);
		})
	}
}

function getAllergies(req,res,next) {
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalDetailsController.getAllergies(patientUsername)
		.then(allergies => {
			res.send({
				statusCode:200,
				message: allergies
			});
		})
		.catch(err=> {
			next(err);
		})
	}
}

function getMedicationHistory(req,res,next) {
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalDetailsController.getMedicationHistory(patientUsername)
		.then(medications=> {
			res.send({
				statusCode:200,
				message: medications
			});
		})
		.catch(err=> {
			next(err);
		})
	}
}
