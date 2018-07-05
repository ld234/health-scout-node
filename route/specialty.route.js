var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var specialtyController = require('../controller/specialty.controller');

router.post('/add',auth.auth(),addSpecialty);

module.exports=router;

function addSpecialty(req,res,next) {
	var newSpecialty = req.body;
	newSpecialty.pracUsername=req.user;
	console.log(newSpecialty);
	if (!newSpecialty.degree) {
		next({
            statusCode: 400,
            message: "Degree is required"
        })
	} else if (!newSpecialty.institution) {
		next({
            statusCode: 400,
            message: "Institution is required"
        })
	} else if (!newSpecialty.specialty) {
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