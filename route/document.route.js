var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var documentController = require('../controller/document.controller');
var multer = require('multer');
var fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, callback){
		var tmpDir = './public/tmp/'+req.user+'/';
		var finalDir = './public/documents/'+req.user+'/';
		if (!fs.existsSync(finalDir)) {
			fs.mkdir(finalDir,(err)=>{
				if (err) callback(new Error('cannot create final directory'));
				else {
					console.log('final directory created');
				}
			})
		}
		if (!fs.existsSync(tmpDir)) {
			fs.mkdir(tmpDir,function(err){
				if (err) {
					callback(new Error('cannot create tmp directory'));
				}
				else {callback(null,tmpDir)};
			})
		}
		else {
			callback(null,tmpDir);
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

router.get('/', auth.auth(), auth.pracAuth(), getDocuments);
router.post('/',auth.auth(),auth.pracAuth(),upload.single('file'),addDocument);
router.delete('/',auth.auth(),auth.pracAuth(),deleteDocument);
router.put('/',auth.auth(),auth.pracAuth(),upload.single('file'),updateDocument);

module.exports = router;

function getDocuments(req,res,next) {
	var pracUsername=req.user;
	documentController.getDocuments(pracUsername)
	.then(documents=> {
		res.status(200).send(documents);
	})
	.catch(err=> {
		next(err);
	})
}

function addDocument(req,res,next) {
	var newDocument=req.body;
	newDocument.pracUsername=req.user;
	if (!newDocument.title) {
		next({
            statusCode: 400,
            message: "Document title is required"
        });
	}
	else if (!req.file) {
		next({
            statusCode: 400,
            message: "Please choose a document"
        });
	}
	else {
		console.log(req.file.path);
		newDocument['file'] = req.file.path.replace('public','').replace(new RegExp( '\\' + path.sep,'g'),'/');
		console.log(newDocument);
		documentController.addDocument(newDocument)
			.then(document => {
				console.log('Document added',document);
				fs.rename(req.file.path,'public'+document.file, function(err){
					if (err) next(err);
					else {
						console.log('File renamed');
						res.status(200).send(document);
					}
				})
			})
			.catch(err => {
				fs.unlink(req.file.path,(err) => {
					if (err) next(err);
					console.log('uploaded file is deleted');
				})
				next(err);
			})
	}
}

function deleteDocument(req,res,next) {
	var pracUsername=req.user;
	var title=req.query.title;
	if (!title) {
		next({
            statusCode: 400,
            message: "Document title is required"
        })
	}
	var deletedDocument = {pracUsername: pracUsername, title: title};
	console.log(deletedDocument.title);
	documentController.deleteDocument(deletedDocument)
		.then(function(file){
			console.log(file);
			fs.unlink('public'+file, function(err){
				if (err) next(err);
				else {
					console.log('Document deleted');
					res.send({
						statusCode:200,
						message: 'Deleted successfully'
					})
				}
			})
		})
		.catch(err=> {
			next(err);
		})
}

function updateDocument(req,res,next) {
	var updatedDocument = req.body;
	updatedDocument.pracUsername=req.user;
	if (!updatedDocument.description) {
		updatedDocument.description="";
	}
	console.log(updatedDocument);
	if (!updatedDocument.newTitle) {
		next({
			statusCode:400,
			message: 'New document title is required'
		})
	}
	else if (!updatedDocument.oldTitle) {
		next({
			statusCode:400,
			message: 'Old document title is required'
		})
	}
	else {
		documentController.updateDocument(updatedDocument)
		.then(function(document){
			if (req.file) { //if the user did specify a new file, we want to delete the old one and replace by the new one
				fs.unlink('public'+document.oldFile, function(err){
					if (err) next(err);
					else {
						console.log('Old file deleted');
					}
				})
				fs.rename(req.file.path,'public'+document.updated.file, function(err){ //move uploaded file from tmp folder to correct folder
					if (err) next(err);
					else {
						console.log('New file added');
						res.status(200).send(document.updated);
					}
				})
			}
			else { //if user does not provide a file, but the new title is different from the old title, we also want to rename the file
				if(document.oldFile !== document.updated.file) {
					fs.rename('public'+document.oldFile,'public'+document.updated.file, function(err){
						if (err) next(err);
						else {
							console.log('File renamed');
							res.status(200).send(document.updated);
						}
					})
				}
				else {
					res.status(200).send(document.updated);
				}
			}
		})
		.catch(err=> {
			if (req.file) { //if user uploaded a temporary file, but the update operation in database fails, we want to delete that tmp
				fs.unlink(req.file.path,(err) => {
					if (err) next(err);
					else {
						console.log('uploaded file is deleted');
					}
				})
			}
			next(err);
		})
	}
}