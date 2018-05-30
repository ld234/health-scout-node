var jwt = require('./../utils/jwt');
var path = require('path');
var authController = require('../controller/auth.controller');

module.exports.auth = function () {
    return function (req, res, next) {
        var token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, function (err, decodedData) {
                if (err) {
                    res.status(401);
                    res.json({
                        message: 'Invalid Token'
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
                message: "Not authorized"
            });
        }
    }
}
