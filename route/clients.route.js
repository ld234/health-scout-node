var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var clientsController = require('../controller/clients.controller');
var clientProfileRouter = require('./client.profile.route');

router.get('/view', auth.auth(), auth.pracAuth(),viewClients);
router.get('/viewNew',auth.auth(),auth.pracAuth(),viewNewClients);
router.use('/clientProfile', clientProfileRouter); //viewClientProfile function is to be put here
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

