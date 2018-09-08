const db = require('../utils/create.db');
const User=db.User;
var router = require('express').Router();

var authController = require('../controller/auth.controller');
const jwt = require('../utils/jwt');
const passport = require('passport');
const auth = require('../middleware/auth');

router.post('/login', login ); //thid does not go through to authController, but handle directly in middleware router auth.route
router.post('/checkAuth', auth.auth(),checkIfAuthenticated); //simply put the user through middleware auth.auth() to verify if the token attached is correct.
router.put('/verifyEmail',verifyEmail);
router.put('/forgetPassword',requestPasswordReset);
router.put('/resetPassword',resetPassword)

module.exports = router;

function checkIfAuthenticated(req, res, next) {
    res.send({message: 'The user is authenticated.'})
}

/* POST login. */
function login (req, res, next) {
    console.log('Logging in');
	//'local' means passport will use the passport-local strategy to authenticate, defined in utils/passport.js
    passport.authenticate('local', {session: false}, (err, user, info) => { //if authentication fail, user will be set to FALSE. If exception, err will be set to TRUE
        if (err) { //server exception
			console.log(err);
            return res.status(400).json({
                message: err.message,
                user: user
            });
        }
        if (!user){ //user=false means failed authentication. Need to give a reason why through info.message
            return res.status(400).json({
				//message:err.message
				message:info.message,
                user: user
            });
        }
        req.login(user, {session: false}, (err) => { //if passport authentication is successful, we want the server to generate a token for user to use later in other requests.
            if (err) {
                res.send(err);
            }
            // generate a signed json web token with object being the username of user and return it in the response
            jwt.sign({username: user.username}, (err,token)=>{
                    if (!err)
                        return res.json({user, token}); //log in successfully will come here
                    else {
						console.log(err);
                        next(err);
					}
            });
        });
    })(req, res,next);
}


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