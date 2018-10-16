var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var patientConnectController = require('../controller/patient.connect.controller');

module.exports=router;

router.post('/',auth.auth(),auth.patientAuth(),connectWithPrac);

function connectWithPrac(req,res,next) {
	var connectInfo=req.body;
	connectInfo.patientUsername=req.user;
	if (!connectInfo.pracUsername) {
		next({
			statusCode:400,
			message: 'Practitioner username is required'
		})
	}
	else if (!connectInfo.stripeToken) {
		next({
			statusCode:400,
			message: 'Credit card information is required'
		})
	}
	else {
		patientConnectController.connectWithPrac(connectInfo)
		.then(newConnection=>{
			res.status(200).send(newConnection);
		})
		.catch(err=>{
			next(err);
		})
	}
}