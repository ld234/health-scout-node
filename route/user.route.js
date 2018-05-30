var router = require('express').Router();
var path = require('path');
var auth = require('../middleware/auth');
var userController = require('../controller/user.controller');

router.get('/', auth.auth(), getUser);
router.post('/', createUser);
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

function createUser(req, res, next) {
    var newUser = req.body;
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
                res.json(user);
            })
            .catch(function (err) {
                next(err);
            })
    }
}