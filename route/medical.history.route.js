var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var medicalHistoryController = require('../controller/medical.history.controller');
module.exports = router;

router.get('/consultHistory',auth.auth(),auth.pracAuth(),getConsultHistory);
router.get('/allergies',auth.auth(),auth.pracAuth(),getAllergies);
router.get('/familyHistory',auth.auth(),auth.pracAuth(),getFamilyHistory);

function getConsultHistory(req,res,next) {
	var patientUsername=req.query.patientUsername;
	var pracUsename=req.user; //we may need to use this if consultation history does not include this practitioner's own consultations
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalHistoryController.getConsultHistory(pracUsename,patientUsername)
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
	var pracUsename=req.user;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalHistoryController.getFamilyHistory(pracUsename,patientUsername)
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

function getAllergies(req,res,next) {
	var patientUsername=req.query.patientUsername;
	var pracUsename=req.user;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		medicalHistoryController.getAllergies(pracUsename,patientUsername)
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
