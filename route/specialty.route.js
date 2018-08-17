var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var specialtyController = require('../controller/specialty.controller');

router.post('/add',auth.auth(),auth.pracAuth(),addSpecialty);
router.delete('/delete',auth.auth(),auth.pracAuth(),deleteSpecialty);

module.exports=router;

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