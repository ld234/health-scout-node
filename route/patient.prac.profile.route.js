var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var patientPracProfileController = require('../controller/patient.prac.profile.controller');

module.exports=router;

router.get('/specialty',auth.auth(),auth.patientAuth(),getSpecialty);
router.get('/qualification',auth.auth(),auth.patientAuth(),getQualification);
router.get('/generalInfo',auth.auth(),auth.patientAuth(),getGeneralInfo); //including average ratings
router.get('/testimonial',auth.auth(),auth.patientAuth(),getTestimonial); //including individual ratings
router.post('/testimonial',auth.auth(),auth.patientAuth(),addTestimonial);

function getSpecialty(req,res,next) {
	var pracUsername=req.query.pracUsername;
	if (!pracUsername) {
		next({
			statusCode:400,
			message: 'Practitioner username is required'
		})
	}
	else {
		patientPracProfileController.getSpecialty(pracUsername)
		.then(specialtyList=>{
			res.status(200).send(specialtyList);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getQualification(req,res,next) {
	var pracUsername=req.query.pracUsername;
	if (!pracUsername) {
		next({
			statusCode:400,
			message: 'Practitioner username is required'
		})
	}
	else {
		patientPracProfileController.getQualification(pracUsername)
		.then(qualificationList=>{
			res.status(200).send(qualificationList);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getGeneralInfo(req,res,next) {
	var pracUsername=req.query.pracUsername;
	if (!pracUsername) {
		next({
			statusCode:400,
			message: 'Practitioner username is required'
		})
	}
	else {
		patientPracProfileController.getGeneralInfo(pracUsername)
		.then(info=>{
			res.status(200).send(info);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getTestimonial(req,res,next) {
	var pracUsername=req.query.pracUsername;
	if (!pracUsername) {
		next({
			statusCode:400,
			message: 'Practitioner username is required'
		})
	}
	else {
		patientPracProfileController.getTestimonial(pracUsername)
		.then(testimonialList=>{
			res.status(200).send(testimonialList);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function addTestimonial(req,res,next) { //only possible if there's a patientDoctorRelation between them
	var patientUsername=req.user;
	var pracUsername=req.query.pracUsername;
	if (!pracUsername) {
		next({
			statusCode:400,
			message: 'Practitioner username is required'
		})
	}
	else {
		patientPracProfileController.addTestimonial(pracUsername,patientUsername)
		.then(data=>{
			res.status(201).send(data);
		})
		.catch(err=>{
			next(err);
		})
	}
}