var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var qualificationController = require('../controller/qualification.controller');

router.get('/',auth.auth(),getQualifications);
router.post('/add',auth.auth(),addQualification);

module.exports=router;

function addQualification(req,res,next) {
	console.log('Adding qualification');
	var newQualification=req.body;
	newQualification.pracUsername=req.user;
	if (!newQualification.degree) {
		next({
            statusCode: 400,
            message: "Degree is required"
        })
	} else if (!newQualification.institution) {
		next({
            statusCode: 400,
            message: "Institution is required"
        })
	} else if (!newQualification.graduateYear) {
		next({
            statusCode: 400,
            message: "Graduation year is required"
        })
	}  else {
		qualificationController.createQualification(newQualification)
			.then(function(qualification) {
				console.log('Qualification added',qualification);
				res.status(201).send(qualification);
			})
			.catch(function(err) {
				next(err);
			})
	}
}

function getQualifications(req,res,next) {
	var username = req.user;
	qualificationController.getQualifications(username)
	.then(qualifcations => res.send(qualifcations))
	.catch( err => next(err));
}