var router=require('express').Router();
var path= require('path');
var auth = require('../middleware/auth');
var exchangeDocumentController = require('../controller/exchange.document.controller');
var multer = require('multer');
var fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, callback){
		var patientTmpDir = './receivedDocuments/tmp/'+req.user+'/';
		var patientDir = './receivedDocuments/'+req.user+'/';
		if (!fs.existsSync(patientDir)) {
			fs.mkdir(patientDir,function(err){
				if (err) {
					callback(new Error('cannot create patient directory'));
				}
			})
		}
		if (!fs.existsSync(patientTmpDir)) {
			fs.mkdir(patientTmpDir,function(err){
				if (err) {
					callback(new Error('cannot create tmp directory'));
				}
				else {callback(null,patientTmpDir)};
			})
		}
		else {
			callback(null,patientTmpDir);
		}
	},
	filename: function (req, file, callback){
		callback(null, file.originalname);
	}
});

const fileFilter = (req, file, callback) => {
	if(file.mimetype === 'application/pdf'){
		callback(null,true);
	}
	else{
		callback(new Error('Invalid file type.'),false);
	}
}

const upload = multer({storage: storage, limits : {fileSize: 1024 * 1024 * 10}, fileFilter : fileFilter});

module.exports=router;

router.get('/', auth.auth(), auth.pracAuth(),getDocumentList);
router.post('/', auth.auth(), auth.pracAuth(),sendDocument);
router.get('/single',getSingleDocument);
router.get('/newReceivedDocuments',auth.auth(),auth.pracAuth(),getNewReceivedDocuments);
router.get('/oldReceivedDocuments',auth.auth(),auth.pracAuth(),getOldReceivedDocuments);
router.put('/seeDocument',auth.auth(),auth.pracAuth(),seeDocument); //can be old or new received document, display pdf on browser(and potentially update status)

//Begins the request API for patients
router.get('/patient',auth.auth(),auth.patientAuth(),getRequestedDocuments); //for patient, to get a list of all requested documents from prac
//router.get('/download',auth.auth(),auth.patientAuth(),downloadDocument); don't need because documents are in public => can request directly
router.post('/upload',auth.auth(),auth.patientAuth(),upload.single('file'),uploadDocument);
router.get('/patient/sent',auth.auth(),auth.patientAuth(),getSentDocuments);

function getSingleDocument(req,res,next) {
	var title = req.query.title;
	var patientUsername = req.query.patientUsername;
	var pracUsername = 'ldt999';
	if (!patientUsername) {
		next({
			statusCode:400,
			message: 'Patient username is required',
		})
	}
	else if (!title) {
		next({
			statusCode:400,
			message: 'Title is required',
		})
	}
	else {
		return exchangeDocumentController.getSingleDocument({pracUsername,patientUsername, title})
		.then(stream=>{
			var stat = fs.statSync('./public/modules/datacollectors/output.pdf');
			res.setHeader('Content-Length', stat.size);
			res.setHeader('Content-disposition', 'inline; filename="' + title + '_' + patientUsername + '"');
			res.setHeader('Content-type', 'application/pdf');
			stream.pipe(res);
		})
		.catch(err=> {
			next(err);
		})
	}

}

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

function getRequestedDocuments(req,res,next) {
	var patientUsername=req.user; //now we get auth from patient instead of practitioner.
	console.log(patientUsername);
	exchangeDocumentController.getRequestedDocuments(patientUsername)
	.then(requestedDocuments=>{
		//console.log(requestedDocuments);
		res.status(200).send(requestedDocuments);
	})
	.catch(err=>{
		next(err);
	})
}

function uploadDocument(req,res,next) {
	var newDocument=req.body;
	newDocument.patientUsername=req.user;
	if (!newDocument.title) {
		next({
            statusCode: 400,
            message: "Document title is required"
        });
	}
	else if (!newDocument.pracUsername) {
		next({
            statusCode: 400,
            message: "Practitioner username is required"
        });
	}
	else if (!req.file) {
		next({
            statusCode: 400,
            message: "Please choose a document"
        });
	}
	else {
		exchangeDocumentController.uploadDocument(newDocument)
		.then(document=>{
			console.log(document);
			var finalDir='./receivedDocuments/'+document.patientUsername+'/'+document.pracUsername+'/';
			if (!fs.existsSync(finalDir)) {
				fs.mkdir(finalDir,function(err){
					if (err) {
						throw err;
					}
					else {
						console.log('Final directory created');
						fs.rename(req.file.path,document.receivedLink,function(err){ //overwrite an existing file with the same title is ok
							if (err) next(err);
							else {
								console.log('File renamed');
								res.status(200).send(document);
							}
						})
					}
				})
			}
			else {
				fs.rename(req.file.path,document.receivedLink,function(err){ //overwrite an existing file with the same title is ok
					if (err) next(err);
					else {
						console.log('File renamed');
						res.status(200).send(document);
					}
				})
			}
		})
		.catch(err=>{
			fs.unlink(req.file.path,function(err){
				if (err) next(err);
				console.log('uploaded file is deleted');
			})
			next(err);
		})
	}
}

function getSentDocuments(req,res,next) {
	var patientUsername=req.user;
	exchangeDocumentController.getSentDocuments(patientUsername)
	.then(sentDocumentList=>{
		res.status(200).send(sentDocumentList);
	})
	.catch(err=>{
		next(err);
	})
}