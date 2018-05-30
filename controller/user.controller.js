var User = require('../model/user.model');
const Op = require('sequelize').Op;
var nodemailer = require("nodemailer");
var crypto = require('crypto');
var secret = 'healthyandfresh';
var authController = require('./auth.controller');

module.exports = {
    getUser: getUser,
    createUser: createUser,
    updateUser: updateUser
}

function updateUser(user) {
    return User.findByIdAndUpdate(user._id, user)
        .then(function (user) {
            return Promise.resolve(user);
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
} 

function getUser(u) {
    return User.findOne({where:{username:u}})
        .then(function (user) {
            return Promise.resolve(user);
        })
        .catch(function(err){
            return Promise.reject({
                statusCode: 400,
                message: err.message
            });
        })
        
}

function createUser(newUser) {
    return User.findAll({ attributes:['username','password','email'], 
                            where:{
                                [Op.or]: [
                                    {username:newUser.username},
                                    {email:newUser.email}
                                ]
                            }
                        })
        .then( (foundUsers) => {
            if (foundUsers.length > 0) {
                return Promise.reject({
                    statusCode: 400,
                    message: 'Email or username existed'
                });
            } else if(newUser.username.length < 6){
                return Promise.reject({
                    statusCode: 400,
                    message: 'Username must contain more than 6 characters.'
                });
            } else if (newUser.password.length < 8){
                return Promise.reject({
                    statusCode: 400,
                    message: 'Password must be longer than 8 characters.'
                });
            } else if (!newUser.password.match('^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]+$')){
                return Promise.reject({
                    statusCode: 400,
                    message: 'Password must contain both letters and digits.'
                });
            } else {
                var salt = crypto.randomBytes(2).toString('hex');
                var hash = crypto.createHmac('sha256', secret)
                    .update(newUser.password.concat(salt))
                    .digest('hex');
                newUser.password = hash;
                newUser.salt = salt;
                var user = new User(newUser);
                authController.sendEmail(user,function(){
                    console.log('Email sent successfully and verification saved.');
                });
                return user.save()
                    .then(function (user) {
                        delete user.dataValues['salt'];
                        delete user.dataValues['password'];
                        return Promise.resolve(user);
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
}