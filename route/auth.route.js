var User = require('../model/user.model');
var router = require('express').Router();
var authController = require('../controller/auth.controller');
const jwt = require('../utils/jwt');
const passport = require('passport');

router.post('/login', login );
router.put('/verifyEmail',verifyEmail);
router.put('/forgetPassword',requestPasswordReset)
router.put('/resetPassword',resetPassword)

module.exports = router;

/* POST login. */
function login (req, res, next) {
    console.log('Logging in');
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            return res.status(400).json({
                message: err.message,
                user: user
            });
        }
        if (!user){
            return res.status(400).json({
                message: err.message,
                user: user
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            // generate a signed json web token with the contents of user object and return it in the response
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

function requestPasswordReset(req,res,next) {
    console.log('in auth.route');
    const email = req.body.email;
    const username = req.body.username;
    authController.requestPasswordReset(username, email, function (err, data){
        if (!err) res.send (data);
        else next(err);
    })
}

function resetPassword(req, res, next) {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    if (!token) {
        next({
            statusCode: 400,
            message: "Invalid password reset link."
        })
    } else {
        authController.resetPassword(newPassword,token)
            .then(function (data) {
                res.send(data);
            })
            .catch(function (err) {
                next(err);
            })
    }
}