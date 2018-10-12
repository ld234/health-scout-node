var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var patientMedicalDetailsController = require('../controller/patient.medical.details.controller');
module.exports = router;

router.post('/allergy',auth.auth(),auth.patientAuth(),addAllergy);
router.delete('/allergy',auth.auth(),auth.patientAuth(),deleteAllergy);
router.get('/allergy',auth.auth(),auth.patientAuth(),getAllergy);
router.post('/familyHistory',auth.auth(),auth.patientAuth(),addFamilyHistory);
router.delete('/familyHistory',auth.auth(),auth.patientAuth(),deleteFamilyHistory);
router.get('/familyHistory',auth.auth(),auth.patientAuth(),getFamilyHistory);
router.post('/medication',auth.auth(),auth.patientAuth(),addMedication);
router.delete('/medication',auth.auth(),auth.patientAuth(),deleteMedication);
router.get('/medication',auth.auth(),auth.patientAuth(),getMedication);

router.get('/consultation',auth.auth(),auth.patientAuth(),getConsultation);

function addAllergy(req,res,next) {
	var patientAllergy = req.body;
	patientAllergy.patientUsername=req.user;
	if (!patientAllergy.allergy) {
		next({
			statusCode:400,
			message: 'Allergy is required'
		})
	}
	else {
		patientMedicalDetailsController.addAllergy(patientAllergy)
		.then(addedAllergy=>{
			res.status(200).send(addedAllergy);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function addFamilyHistory(req,res,next) {
	var patientRelation = req.body;
	patientRelation.patientUsername=req.user;
	if (!patientRelation.familyRelation) {
		next({
			statusCode:400,
			message: 'A family member is required'
		})
	}
	else {
		patientMedicalDetailsController.addFamilyHistory(patientRelation)
		.then(addedRelation=>{
			res.status(200).send(addedRelation);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function addMedication(req,res,next) {
	var patientMedication = req.body;
	patientMedication.patientUsername=req.user;
	if (!patientMedication.fillDate) {
		next({
			statusCode:400,
			message: 'Fill date is required'
		})
	}
	else if (!patientMedication.medication) {
		next({
			statusCode:400,
			message: 'Medication is required'
		})
	}
	else {
		patientMedicalDetailsController.addMedication(patientMedication)
		.then(addedMedication=>{
			res.status(200).send(addedMedication);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function deleteAllergy(req,res,next) {
	var delAllergy={};
	delAllergy.patientUsername=req.user;
	delAllergy.allergy=req.query.allergy;
	if (!delAllergy.allergy) {
		next({
			statusCode:400,
			message: 'Allergy is required'
		})
	}
	else {
		patientMedicalDetailsController.deleteAllergy(delAllergy)
		.then(data=>{
			res.send({
				statusCode:200,
				message: data
			})
		})
		.catch(err=>{
			next(err);
		})
	}
}

function deleteFamilyHistory(req,res,next) {
	var delRelation={};
	delRelation.patientUsername=req.user;
	delRelation.familyRelation=req.query.familyRelation;
	if (!delRelation.familyRelation) {
		next({
			statusCode:400,
			message: 'family relation is required'
		})
	}
	else {
		patientMedicalDetailsController.deleteFamilyHistory(delRelation)
		.then(data=>{
			res.send({
				statusCode:200,
				message: data
			})
		})
		.catch(err=>{
			next(err);
		})
	}
}

function deleteMedication(req,res,next) {
	var delMedication={};
	delMedication.patientUsername=req.user;
	delMedication.fillDate=req.query.fillDate;
	delMedication.medication=req.query.medication;
	if (!delMedication.fillDate) {
		next({
			statusCode:400,
			message: 'Fill Date is required'
		})
	}
	else if (!delMedication.medication) {
		next({
			statusCode:400,
			message: 'Medication is required'
		})
	}
	else {
		patientMedicalDetailsController.deleteMedication(delMedication)
		.then(data=>{
			res.send({
				statusCode:200,
				message: data
			})
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getFamilyHistory(req,res,next) {
	var patientUsername=req.user;
	
	patientMedicalDetailsController.getFamilyHistory(patientUsername)
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

function getMedication(req,res,next) {
	var patientUsername=req.user;
	patientMedicalDetailsController.getMedication(patientUsername)
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

function getAllergy(req,res,next) {
	var patientUsername=req.user;
	patientMedicalDetailsController.getAllergy(patientUsername)
	.then(allergyList => {
		res.send({
			statusCode:200,
			message: allergyList
		});
	})
	.catch(err=> {
		next(err);
	})
}

function getConsultation(req,res,next) {
	var patientUsername=req.user;
	patientMedicalDetailsController.getConsultation(patientUsername)
	.then(consultList=>{
		res.send({
			statusCode:200,
			message: consultList
		})
	})
	.catch(err=>{
		next(err);
	})
}
