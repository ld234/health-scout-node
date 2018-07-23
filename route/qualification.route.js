var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var qualificationController = require('../controller/qualification.controller');

<<<<<<< HEAD
router.get('/',auth.auth(),getQualifications);
router.post('/',auth.auth(),addQualification);
=======
router.post('/add',auth.auth(),addQualification);
router.put('/update',auth.auth(),updateQualification);
router.delete('/delete',auth.auth(),deleteQualification);
>>>>>>> kevin

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
				console.log('Qualification added',qualification.dataValues);
				res.status(201).send(qualification.dataValues);
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

function updateQualification(req,res,next) {
	var updatedQualification= req.body;
	updatedQualification.pracUsername=req.user;
	if (!updatedQualification.oldDegree) {
		next({
			statusCode: 400,
			message: "Old degree is required"
		})
	}
	else if (!updatedQualification.newDegree) {
		next({
			statusCode: 400,
			message: "New degree is required"
		})
	}
	else if (!updatedQualification.oldInstitution) {
		next({
			statusCode: 400,
			message: "Old institution is required"
		})
	}
	else if (!updatedQualification.newInstitution) {
		next({
			statusCode: 400,
			message: "New institution is required"
		})
	}
	else if (!updatedQualification.oldGraduateYear ) {
		next({
			statusCode: 400,
			message: "Old graduate year is required"
		})
	}
	else if (!updatedQualification.newGraduateYear) {
		next({
			statusCode: 400,
			message: "New graduate year is required"
		})
	}
	//for description, if the user update it to be an empty string, we put description:"" in updatedQualification
	else {
		//console.log(updatedQualification);
		qualificationController.updateQualification(updatedQualification)
		.then(function(qualification){
			console.log('qualification updated');
			res.send({
				statusCode:200,
				message: qualification
			})
		})
		.catch(function(err){
			next(err);
		})
	}
}

function deleteQualification(req,res,next) {
	var pracUsername=req.user;
	var degree=req.query.degree;
	var institution = req.query.institution;
	var graduateYear= req.query.graduateYear;
	if (!degree) {
		next({
            statusCode: 400,
            message: "Degree is required"
        })
	}
	else if (!institution) {
		next({
            statusCode: 400,
            message: "Institution is required"
        })
	}
	else if (!graduateYear) {
		next({
            statusCode: 400,
            message: "Graduate year is required"
        })
	}
	var deletedQualification={pracUsername:pracUsername, degree: degree, institution: institution, graduateYear: graduateYear};
	qualificationController.deleteQualification(deletedQualification)
		.then(function(qualification){
			console.log('qualification deleted');
			res.send({
				statusCode:200,
				message: qualification
			})
		})
		.catch(function(err){
			next(err);
		})
}