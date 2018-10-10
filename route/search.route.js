var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var searchController=require('../controller/search.controller');

router.get('/radius',auth.auth(),auth.patientAuth(),getNearbyPractitioners);
router.get('/others',auth.auth(),auth.patientAuth(),getPractitionersByTypeAndSpecialty);


module.exports=router;

function getNearbyPractitioners(req,res,next) {
	//var patientUsername=req.user;
	var searchConditions={};
	searchConditions.latitude= req.query.latitude;
	searchConditions.longitude=req.query.longitude;
	searchConditions.radius=req.query.radius;
	if (!searchConditions.latitude) {
		next({
			statusCode:400,
			message: 'Latitude is required'
		})
	}
	else if (!searchConditions.longitude) {
		next({
			statusCode:400,
			message: 'Longitude is required'
		})
	}
	else if (!searchConditions.radius) {
		next({
			statusCode:400,
			message: 'Status is required'
		})
	}
	else {
		searchController.getNearbyPractitioners(searchConditions)
		.then (pracList =>{
			res.status(200).send(pracList);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getPractitionersByTypeAndSpecialty(req,res,next) {
	var pracType = req.query.pracType;
	var specialty=req.query.specialty;
	searchController.getPractitionersByType(pracType,specialty)
	.then(pracList=>{
		res.status(200).send(pracList);
	})
	.catch(err=>{
		next(err);
	})
}