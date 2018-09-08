var router=require('express').Router();
var path= require('path');
var auth = require('../middleware/auth');
var exchangeDocumentController = require('../controller/exchange.document.controller');
module.exports=router;

router.get('/', auth.auth(), auth.pracAuth(),getDocumentList);
router.post('/', auth.auth(), auth.pracAuth(),sendDocument);
router.get('/newReceivedDocuments',auth.auth(),auth.pracAuth(),getNewReceivedDocuments);
router.get('/oldReceivedDocuments',auth.auth(),auth.pracAuth(),getOldReceivedDocuments);
router.put('/seeDocument',auth.auth(),auth.pracAuth(),seeDocument); //can be old or new received document, display pdf on browser(and potentially update status)

/*
 * Begins the request API for patients

router.get('/patient',auth.auth(),auth.patientAuth(),getRequestedDocuments); //for patient, to get a list of all requested documents from prac
router.get('/download',auth.auth(),auth.patientAuth(),downloadDocument);
router.post('/upload',auth.auth(),auth.patientAuth(),uploadDocument);
**/

function getDocumentList(req,res,next) {
	var pracUsername=req.user;
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required',
		})
	}
	else {
		return exchangeDocumentController.getDocumentList(pracUsername,patientUsername)
		.then(documentList=>{
			res.status(200).send(documentList);
		})
		.catch(err=> {
			next(err);
		})
	}
}

function sendDocument(req,res,next) {
	var document=req.body;
	document.pracUsername=req.user;
	if (!document.patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else if (!document.title) {
		next({
			statusCode:400,
			message: 'Document title is required'
		})
	}
	else {
		return exchangeDocumentController.sendDocument(document)
		.then(newDocument=>{
			res.status(200).send(newDocument);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getNewReceivedDocuments(req,res,next) {
	var pracUsername=req.user;
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		exchangeDocumentController.getNewReceivedDocuments(pracUsername,patientUsername)
		.then(newDocuments=>{
			res.status(200).send(newDocuments);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function getOldReceivedDocuments(req,res,next) {
	var pracUsername=req.user;
	var patientUsername=req.query.patientUsername;
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		exchangeDocumentController.getOldReceivedDocuments(pracUsername,patientUsername)
		.then(oldDocuments=>{
			res.status(200).send(oldDocuments);
		})
		.catch(err=>{
			next(err);
		})
	}
}

function seeDocument(req,res,next) {
	var document=req.body;
	document.pracUsername=req.user;
	if (!document.title) {
		next({
			statusCode:400,
			message: 'Document title is required'
		})
	}
	else if (!document.patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required'
		})
	}
	else {
		exchangeDocumentController.seeDocument(document)
		.then(stream=>{
			res.setHeader('Content-disposition', 'inline; filename="' + document.title + '_' + document.patientUsername + '"');
			res.setHeader('Content-type', 'application/pdf');
			stream.pipe(res);
		})
		.catch(err=>{
			next(err);
		})
	}
}

/*function getRequestedDocuments(req,res,next) {
	var patientUsername-req.user;
	exchangeDocumentController.getRequestedDocuments(patientUsername)
	.then(requestedDocuments=>{
		res.status(200).send(requestedDocuments);
	})
	.catch(err=>{
		next(err);
	})
}*/