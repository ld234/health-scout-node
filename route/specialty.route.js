var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var specialtyController = require('../controller/specialty.controller');

router.get('/:pracType', auth.auth(), getAvailableSpecialties);
router.post('/',auth.auth(),auth.pracAuth(),addSpecialty);
router.get('/',auth.auth(), auth.pracAuth(),getSpecialties);
router.delete('/',auth.auth(),auth.pracAuth(),deleteSpecialty);

module.exports=router;

function getAvailableSpecialties (req,res,next){
	var pracType = req.param('pracType'); //':pracType' on URL is a placeholder for the actual pracType in params (example: Dietitian, request becomes GET specialty/Dietitian)
	if (pracType){
		specialtyController.getAvailableSpecialties (pracType) 
		.then( (specialtyList) => {
			res.status(200).send(specialtyList);
		})
		.catch((err) => next(err));
	}
	else{
		next({
			status: 400,
			message: 'No practitioner type provided.'
		})
	}
}

function getSpecialties (req,res,next){
	var username = req.user;
	if (username){
		specialtyController.getSpecialties (username) 
		.then( (specialtyList) => {
			res.status(200).send(specialtyList);
		})
		.catch((err) => next(err));
	}
	else{
		next({
			statusCode: 400,
			message: 'No username to get practitioner\'s specialties.'
		})
	}
}

function addSpecialty(req,res,next) {
	var newSpecialty = req.body;
	newSpecialty.pracUsername=req.user;
	console.log(newSpecialty);
	if (!newSpecialty.specialty) {
		next({
            statusCode: 400,
            message: "Specialty is required"
        })
	} else {
		specialtyController.createSpecialty(newSpecialty)
			.then(function(specialty) {
				console.log('Specialty added',specialty);
				res.status(201).send(specialty);
			})
			.catch(function(err) {
				next(err);
			})
	}
}

function deleteSpecialty(req,res,next) {
	var specialty = req.query.specialty; //this is the name of the specialty
	var pracUsername=req.user;
	if (!specialty) {
		next({
            statusCode: 400,
            message: "Specialty is required"
        })
	}
	var deletedSpecialty={specialty: specialty, pracUsername: pracUsername};
	console.log(deletedSpecialty);
	specialtyController.deleteSpecialty(deletedSpecialty)
		.then(function(specialty) {
			console.log('Specialty deleted');
			res.send({
				statusCode:200,
				message: specialty
			})
		})
		.catch(function(err){
			next(err);
		})
}