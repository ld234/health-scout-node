var User = require('../model/user.model');
var router = require('express').Router();
var authController = require('../controller/auth.controller');
const jwt = require('../utils/jwt');
const passport = require('passport');

router.post('/login', login );
router.put('/verifyEmail',verifyEmail);
router.post('/forgot',sendResetEmail);
router.get('/resetPassword',verifyLink);
router.post('/resetPassword',resetPassword);

module.exports = router;

/* POST login. */
function login (req, res, next) {
    console.log('Logging in')
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: err.message,
                user: user
            });
        }
       req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
           // generate a signed son web token with the contents of user object and return it in the response
           jwt.sign({username: user.username}, (err,token)=>{
				if (!err)
					return res.json({user, token});
				else 
					next(err);
		   });
           
        });
    })(req, res);
}

/*
function login(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username) {
        next({
            statusCode: 400,
            message: "Username is required"
        })
    } else if (!password) {
        next({
            statusCode: 400,
            message: "Password is required"
        })
    } else {
        authController.login(username, password)
            .then(function (token) {
                res.send(token)
            })
            .catch(function (err) {
                next(err);
            })
    }
}*/


function verifyEmail(req, res, next) {
    var token = req.query.token;
    if (!token) {
        next({
            statusCode: 400,
            message: "Cannot verify email."
        })
    } else {
        authController.verifyEmail(token)
            .then(function (data) {
				console.log('receive', data);
                res.send(data);
            })
            .catch(function (err) {
                next(err);
            })
    }
}

function verifyLink(req,res,next) {
	var token = req.query.token;
	if (!token) {
		next({
            statusCode: 400,
            message: "Password reset token is invalid"
        })
	} else {
		authController.verifyLink(token)
			.then(function(user) {
				console.log('Token verified', user);
                res.status(201).send(user);
			})
			.catch(function(err) {
				next(err);
			});
	}
}

function sendResetEmail(req,res,next) {
	var user= req.body;
	if (!user.email) {
		next({
            statusCode: 400,
            message: "Email is required"
        })
		/*return res.status(400).json({
			message: err.message,
			user: user
		});*/
	}
	return User.findOne({attributes: ['username','fName','email'], where: {email : user.email}})
		.then((foundUser) => {
			if (foundUser==null) {
				return Promise.reject({
                    statusCode: 400,
                    message: 'Email does not exist'
                });
			}
			else {
				authController.sendResetEmail(foundUser)
					.then(function (data) {
						return res.json(data);
					})
					.catch(function (err) {
						console.log(err);
						next(err);
					})
			}
		})
		.catch(function(err) {
			next(err);
		});
}

function resetPassword(req,res,next) {
	var passwords=req.body;
	passwords.token=req.query.token;
	if (!passwords.newPassword) {
		next({
            statusCode: 400,
            message: "Please enter your new password"
        })
	} else if (passwords.newPassword.length < 8){
		next({
			statusCode: 400,
			message: 'Password must be longer than 8 characters.'
		});
	} else if (!passwords.newPassword.match('^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]+$')){
		next({
			statusCode: 400,
			message: 'Password must contain both letters and digits.'
		});
	} else if (!passwords.confirmPassword) {
		next({
            statusCode: 400,
            message: "Please confirm your new password"
        })
	}
	else if (passwords.newPassword !== passwords.confirmPassword) {
		next({
            statusCode: 400,
            message: "Password and confirm are not identical"
        })
	}
	else {
		authController.resetPassword(passwords)
			.then(function(user) {
				console.log('password changed');
				console.log(user);
				res.status(201).json(user);
			})
			.catch(function(err) {
				next(err);
			});
	}
}