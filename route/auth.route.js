var router = require('express').Router();
var authController = require('../controller/auth.controller');

router.post('/', login);
router.put('/verifyEmail',verifyEmail);

module.exports = router;

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
            .then(function (token) {
                res.send(token)
            })
            .catch(function (err) {
                next(err);
            })
    }
}