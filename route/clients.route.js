var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var clientsController = require('../controller/clients.controller');

router.get('/view', auth.auth(), viewClients);
router.get('/viewNew',auth.auth(),viewNewClients);
router.put('/clickNew',auth.auth(),seeNewClient); //when practitioner actually clicks on a new client, we want to update the seen attribute to true in PatientDoctorRelation
//router.get('/search',auth.auth(),searchClients);

module.exports = router;

function viewClients(req,res,next) {
	var pracUsername=req.user;
	clientsController.getClients(pracUsername)
		.then(function(clients){
			res.send(clients);
		})
		.catch(function(err){
			next(err);
		});
}

function viewNewClients(req,res,next) {
	var pracUsername=req.user;
	clientsController.getNewClients(pracUsername)
		.then(function(clients){
			res.send(clients);
		})
		.catch(err=> {
			next(err);
		})
}

function seeNewClient(req,res,next) {
	var patientUsername= req.query.patientUsername;
	var pracUsername=req.user;
	clientsController.seeNewClient(patientUsername,pracUsername)
		.then(function(updatedClient){
			res.send({
				statusCode:200,
				message: updatedClient
			});
		})
		.catch(err=>{
			next(err);
		})
}

/*function searchClients(req,res,next) {
	var pracUsername=req.user;
	var patientName=req.query.patientName; //name not username
	clientsController.searchClients(pracUsername,patientName)
		.then(function(foundClients){
			res.send(foundClients);
		})
		.catch(err=>{
			next(err);
		})
}*/

