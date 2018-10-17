var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var clientsController = require('../controller/clients.controller');
var clientProfileRouter = require('./client.profile.route');


router.put('/clickNew',auth.auth(),auth.pracAuth(),seeNewClient); //when practitioner actually clicks on a new client, we want to update the seen attribute to true in PatientDoctorRelation
router.get('/', auth.auth(), auth.pracAuth(),viewClients);
router.get('/new',auth.auth(),auth.pracAuth(),viewNewClients);
router.use('/profile', clientProfileRouter); //viewClientProfile function is to be put here
//router.get('/search',auth.auth(),searchClients);

module.exports = router;

function viewClients(req,res,next) {
	var pracUsername = req.user;
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
			console.log('Client seen');
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