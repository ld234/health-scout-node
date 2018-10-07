var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var searchController=require('../controller/search.controller');

router.post('/radius',auth.auth(),auth.patientAuth(),getNearbyPractitioners);

module.exports=router;

function getNearbyPractitioners(req,res,next) {
	//var patientUsername=req.user;
	var searchConditions = req.body;
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