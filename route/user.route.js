var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var userController = require('../controller/user.controller');
var multer = require('multer');
const passport = require('passport');

const storage = multer.diskStorage({
	destination: function (req, file, callback){
		callback(null, 'public/profilePics/');
	},
	filename: function (req, file, callback){
		let fileNames = file.originalname.split('.');
		let ext = fileNames[fileNames.length-1];
		//let filename = req.file.filename;
		callback(null, req.body.username + '-' + Date.now() +'.' +ext);
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
router.post('/', upload.single('profilePic'), createUser);
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
    const abn = req.body.abn;
    const medicalProviderNumber =req.body.medicalProviderNum;
    userController.checkPractitionerDetails(abn, medicalProviderNumber)
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
            .catch(function (err) {
                next(err);
            })
    }
}