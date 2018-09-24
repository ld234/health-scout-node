var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var userController = require('../controller/user.controller');
var multer = require('multer');
const passport = require('passport');
var fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, callback){
		var dir = 'public/profilePics/'+req.body.username+'/';
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			callback(null, dir);
		}
		else {
			callback(new Error('Existing folder implies username already exists'),false);
		}
	},
	filename: function (req, file, callback){
		let fileNames = file.originalname.split('.');
		let ext = fileNames[fileNames.length-1];
		callback(null, req.body.username + '-' + Date.now() +'.' +ext); //date is not needed here because we only want to store one profile pic for each user.
	}
});

const fileFilter = (req, file, cb) => {
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
		cb(null,true);
	}
	else{
		cb(new Error('Invalid file type.'),false);
	}
}

const upload = multer({storage: storage, limits : {fileSize: 1024 * 1024 * 10}, fileFilter : fileFilter});


router.get('/', auth.auth(), getUser);
router.post('/', upload.single('profilePic'), createUser); //this is done for general user who only wants to register as a patient.
router.post('/prac',upload.single('profilePic'),createPractitioner); //this is done after the createUser() one, if the user wants to register as a practitioner as well
router.post('/checkUserDetails', checkUserDetails);
router.post('/checkPracDetails', checkPractitionerDetails);
router.put('/', auth.auth(), updateUser);

module.exports = router;

function updateUser(req, res, next) {
    var id = req.params.id;
    var user = req.body;
    user._id = id;
    userController.updateUser(user)
        .then(function (user) {
            res.send(user);
        })
        .catch(function (err) {
            next(err);
        })
}

function getUser(req, res, next) {
    var username = req.user;
    userController.getUser(username)
        .then(function (user) {
            res.send(user);
        })
        .catch(function (err) {
            next(err);
        })
}

function checkUserDetails(req, res, next) {
    userController.checkUserDetails(req.body)
        .then(function (user) {
            res.send(user);
        })
        .catch(function (err) {
            next(err);
        })
}

function checkPractitionerDetails(req, res, next) {
    const business = {abn: req.body.ABN, name: req.body.businessName, address:req.body.businessAddress};
    const medicalProviderNumber =req.body.medicalProviderNum;
    console.log(req.body)
    userController.checkPractitionerDetails(business, medicalProviderNumber)
        .then(function (user) {
            res.send(user);
        })
        .catch(function (err) {
            next(err);
        })
}

function createUser(req, res, next) {
    var newUser = req.body;
    if (req.file)
	    newUser['profilePic'] = req.file.path.replace('public','').replace(new RegExp( '\\' + path.sep,'g'),'/');
    if (!newUser.username) {
        next({
            statusCode: 400,
            message: "Username is required"
        })
    } else if (!newUser.password) {
        next({
            statusCode: 400,
            message: "Password is required"
        })
    } else if (!newUser.email) {
        next({
            statusCode: 400,
            message: "Email is required"
        })
    } else {
        userController.createUser(newUser)
            .then(function (user) {
				console.log('user created', user);
                res.status(201).send(user);
            })
            .catch(function (err) { //if err happens, we want to remove the profile Pic directory for the new user we just uploaded
				var uploadDir='public/profilePics/'+req.body.username;
				fs.readdir(uploadDir,function(err,files){
					if (err) throw err;
					files.forEach(function(file,index){
						var curPath=uploadDir+"/"+file;
						fs.unlink(curPath,function(err){
							if (err) throw err;
							console.log('successfully deleted '+curPath);
							if (index==files.length-1) {
								fs.rmdir(uploadDir,(err)=>{
									if (err) throw err;
									console.log('successfully deleted '+uploadDir);
								})
							}
						});
					});
				});
                next(err);
            })
    }
}

function createPractitioner(req,res,next) {
	var newPrac = req.body;
	if (req.file)
	    newPrac['profilePic'] = req.file.path.replace('public','').replace(new RegExp( '\\' + path.sep,'g'),'/');
    if (!newPrac.username) {
        next({
            statusCode: 400,
            message: "Username is required"
        })
    } else if (!newPrac.password) {
        next({
            statusCode: 400,
            message: "Password is required"
        })
    } else if (!newPrac.email) {
        next({
            statusCode: 400,
            message: "Email is required"
        })
    } 
	else {
        userController.createPractitioner(newPrac)
            .then(function (practitioner) {
				console.log('Practitioner created', practitioner);
                res.status(201).send(practitioner);
            })
            .catch(function (err) { //if err happens, we want to remove the profile Pic directory for the new user we just uploaded
				var uploadDir='public/profilePics/'+req.body.username;
				fs.readdir(uploadDir,function(err,files){
					if (err) throw err;
					files.forEach(function(file,index){
						var curPath=uploadDir+"/"+file;
						fs.unlink(curPath,function(err){
							if (err) throw err;
							console.log('successfully deleted '+curPath);
							if (index==files.length-1) {
								fs.rmdir(uploadDir,(err)=>{
									if (err) throw err;
									console.log('successfully deleted '+uploadDir);
								})
							}
						});
					});
				});
                next(err);
            })
    }
}