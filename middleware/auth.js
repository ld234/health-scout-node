var jwt = require('./../utils/jwt');
var path = require('path');
var authController = require('../controller/auth.controller');

// Check if a token is valid for a user in general
module.exports.auth = function () {
    return function (req, res, next) {
        var token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, function (err, decodedData) {
                if (err) {
                    res.status(401);
                    res.json({
                        message: err.message
                    });
                } else {
                    var user = decodedData.username;
                    authController.checkAuth({
                        username: user
                    })
                        .then(function (user) {
                            req.user = user.dataValues.username;
                            next();
                        })
                        .catch(function (err) {
                            res.status(401);
                            res.json({
                                message: 'Invalid token, user not found'
                            });
                        });
                }
            })
        } else {
            res.status(401);
            res.json({
                message: "User Not authorized"
            });
        }
    }
}

//check if a token is valid for a practitioner. Continue from auth() above,
module.exports.pracAuth = function() {
	return function (req, res, next) {
		authController.checkPracAuth({
			username: req.user,
		})
		.then(function(practitioner){
			req.user = practitioner.dataValues.pracUsername;
			console.log('Practitioner found');
			next();
		})
		.catch(err => {
			res.status(401);
            res.json({
                message: "Practitioner Not authorized"
            });
		})
	}
}
