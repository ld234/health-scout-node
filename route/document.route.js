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
//router.get('/single',auth.auth(),auth.pracAuth(),getDocument); //when practitioner clicks on the document on screen, it pops up with the actual pdf document
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

/*function getDocument(req,res,next) {
	var pracUsername=req.user;
	var title = req.query.title;
	if (!title) {
		next({
			statusCode: 400,
			message: 'Document title is required'
		})
	}
	documentController.getDocument(pracUsername,title)
	.then (stream=> {
		res.setHeader('Content-disposition', 'inline; filename="' + title + '"');
		res.setHeader('Content-type', 'application/pdf');
		stream.pipe(res);
	})
	.catch(err=> {
		next(err);
	})
}*/

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
		newDocument['file'] = req.file.path.replace('public','').replace(new RegExp( '\\' + path.sep,'g'),'/');
		documentController.addDocument(newDocument)
			.then(document => {
				fs.rename(req.file.path,'public'+document.file, function(err){
					if (err) next(err);
					else {
						res.status(200).send(document);
					}
				})
			})
			.catch(err => {
				fs.unlink(req.file.path,(err) => {
					if (err) next(err);
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
	documentController.deleteDocument(deletedDocument)
		.then(function(file){
			fs.unlink('public'+file, function(err){
				if (err) next(err);
				else {
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
						res.status(200).send(document.updated);
					}
				})
			}
			else { //if user does not provide a file, but the new title is different from the old title, we also want to rename the file
				if(document.oldFile !== document.updated.file) {
					fs.rename('public'+document.oldFile,'public'+document.updated.file, function(err){
						if (err) next(err);
						else {
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