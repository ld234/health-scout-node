var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var searchController=require('../controller/search.controller');

router.get('/radius',auth.auth(),auth.patientAuth(),getNearbyPractitioners);
router.get('/others',auth.auth(),auth.patientAuth(),getPractitionersByTypeAndSpecialty);


module.exports=router;

function getNearbyPractitioners(req,res,next) {
	var searchConditions={};
	searchConditions.latitude= req.query.latitude;
	searchConditions.longitude=req.query.longitude;
	searchConditions.radius=req.query.radius;
	searchConditions.patientUsername=req.user;
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
			console.log(pracList);
			res.status(200).send(pracList);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getPractitionersByTypeAndSpecialty(req,res,next) {
	var pracType = req.query.pracType;
	var specialties=req.query.specialties;
	var patientUsername=req.user;
	searchController.getPractitionersByTypeAndSpecialty(pracType,specialties,patientUsername)
	.then(pracList=>{
		res.status(200).send(pracList);
	})
	.catch(err=>{
		next(err);
	})
}