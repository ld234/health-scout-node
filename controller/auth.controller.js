var User = require('../model/user.model');
var Verification = require('../model/verification.model');
var crypto = require('crypto');
var jwt = require('../utils/jwt');
var secret = 'healthyandfresh';
var nodemailer = require('nodemailer');

module.exports = {
    login,
    checkAuth,
    verifyEmail,
    sendEmail
}

function login(username, password) {
    return User.findOne({ attributes:['username','password','salt','active'] ,where: {
            username: username
        }
    })
        .then(function (user) {
            if (user) {
                var hash = crypto.createHmac('sha256', secret)
                    .update(password.concat(user.salt))
                    .digest('hex');
                // Account is activated? 
                if (!user.active)
                    return Promise.reject({
                        statusCode: 400,
                        message: 'This account has not been activated.'
                    });
                // Password is correct? 
                else if(!user.password.localeCompare(hash) == 0){
                    return Promise.reject({
                        statusCode: 400,
                        message: 'Incorrect password.'
                    });
                }
                // Return token
                return new Promise(function (resolve, reject) {
                    jwt.sign({
                        username: user.username,
                    }, function (err, token) {
                        if (err) {
                            reject({
                                statusCode: 400,
                                message: err.message
                            });
                        } else {
                            resolve({token: token});
                        }
                    })
                });

            } else {
                return Promise.reject({
                    statusCode: 400,
                    message: 'Username or password is incorrect'
                });
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
}

// Verify the link from the email
function verifyEmail(token){
    return jwt.verify (token, function (err, decodedData) {
        if (err) {
            return Promise.reject({
                statusCode: 401,
                message: 'Invalid token'
            });
        } else {
            Verification.destroy({where:{username:decodedData.username}});
            return User.findOne({attributes: ['username','email'], where:{ username: decodedData.username}})
                .then(function (foundUser) {
                    return User.update(
                            { active: 1 },
                            { where: {username: foundUser.username} }
                        )
                        .then (function (result) {
                            return Promise.resolve({
                                message: `Your email ${foundUser.email} is verified successfully.`
                            });
                        })
                        .catch(function (err){
                            return Promise.reject({
                                statusCode: 401,
                                message: err.message
                            });
                        });
                })
                .catch(function (err) {
                    return Promise.reject({
                        statusCode: 401,
                        message: err.message
                    })
                });
        }
    })
}

// Send email to registered user
function sendEmail(user,callback){
    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "healthscout321@gmail.com",
            pass: "healthyandfresh"
        }
    });
    var rand = crypto.randomBytes(2).toString('hex');
    jwt.sign({username: user.username,verification: rand},function(err,token){
        var link="http://localhost:8888/verify?id="+token;
        mailOptions={
            to: user.email, 
            subject : "Welcome to HealthScout",
            html : "Hello,<br><br> Thank you for using our service. Please click on the link to verify your email.<br><a href="+link+">Click here to verify</a><br><br>Citron Inc." 
        }
        
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log(rand,'abc');
                var newVerification = {  
                    username: user.username,
                    verification: rand
                };
                var verify = new Verification (newVerification);
                verify.save()
                .catch(function(err){
                    console.log(err);
                });
                callback();
            }
        });            
    });
}

// Check whether username exists
function checkAuth(user) {
    return User.findOne( {attributes:['username'],where: { username : user.username}})
        .then(function (foundUser) {
            if (foundUser) {
                return Promise.resolve(foundUser);
            } else {
                return Promise.reject({
                    message: 'Not Found'
                });
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
}
