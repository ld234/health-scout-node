var User = require('../model/user.model');
const Op = require('sequelize').Op;
var Verification = require('../model/verification.model');
var crypto = require('crypto');
var jwt = require('../utils/jwt');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
require('dotenv').config()

module.exports = {
    // login,
    checkAuth,
    verifyEmail,
    sendEmail,
	sendResetEmail,
	verifyLink,
	resetPassword
}

// Outdated
function login(username, password) {
    return User.findOne({ attributes:['username','password','active'] ,where: {
            username: username
        }
    })
        .then(function (user) {
            if (user) {
                /* var hash = crypto.createHmac('sha256', secret)
                    .update(password.concat(user.salt))
                    .digest('hex'); */
                // Account is activated? 
                if (!user.active)
                    return Promise.reject({
                        statusCode: 400,
                        message: 'This account has not been activated.'
                    });
				else{
					// Load hash from your password DB.
					bcrypt.compare(password, user.password, function(err, res) {
						if (res == false){
							return Promise.reject({statusCode: 400, message:'Incorrect username or password.'});
						}
					});
				}
                // Return token
                return new Promise(function (resolve, reject) {
                    jwt.sign({
                        username: user.username,
                    }, function (err, token) {
                        if (err) {
                            reject(err);
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
					console.log(foundUser.dataValues);
                    return User.update(
                            { active: 1 },
                            { where: {username: foundUser.dataValues.username} }
                        )
                        .then (function (result) {
							console.log('update active', result);
                            return Promise.resolve({
                                message: `Your email ${foundUser.email} is verified successfully.`
                            });
                        })
                        .catch(function (err){
							console.log(err);
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

//verify the password reset link
function verifyLink(token) {
	return jwt.verify (token, function (err, decodedData) {
        if (err) {
            return Promise.reject({
                statusCode: 401,
                message: 'Invalid token'
            });
        } else {
			//Verification.destroy({where:{username:decodedData.username}});
			
            return User.findOne({attributes: ['username'], where:{ username: decodedData.username}})
                .then(function (foundUser) {
					return Verification.findAll({attributes: ['username','verification'], //to make sure the verification token is not an old one
						where: {[Op.and]: [
							{username: foundUser.username}, 
							{verification: decodedData.verification}]
						}
					})
					.then(function(foundVerifications) {
						if (foundVerifications.length==1) {
							return Promise.resolve(foundVerifications[0].dataValues);
						}
						else {
							return Promise.reject({
								statusCode:401,
								message: 'Outdated token'
							})
						}
					})
					.catch(function(err) {
						return Promise.reject(err);
					});
				})
				.catch(function (err){
					console.log(err);
					return Promise.reject({
						statusCode: 401,
						message: err.message
					});
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
            pass: process.env.EMAIL_PASSWORD
        }
    });
    var rand = crypto.randomBytes(2).toString('hex');
    jwt.sign({username: user.username,verification: rand},function(err,token){
        var link="http://localhost:8888/verify?id="+token;
        mailOptions={
            to: user.email, 
            subject : "Welcome to HealthScout",
		html : `Hello ${user.fName},<br><br> Thank you for using our service. Please click on the link to verify your email.<br><a href="${link}">Click here to verify</a><br><br><i><b>Citron Inc.</b></i>`
        }
        smtpTransport.sendMail(mailOptions)
		.then( response => {
			console.log(rand,'email sent successfully');
		})
		.catch( err => {
			console.log(err);
        });            
    });
	var newVerification = {  
		username: user.username,
		verification: rand
	};
	return Verification.create(newVerification)
	.then (function (data) {
		return Promise.resolve(data);
	})
	.catch(function(err){
		return Promise.reject(err);
	});
}

//function send email to reset password
function sendResetEmail(user,callback) {
	var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "healthscout321@gmail.com",
            pass: process.env.EMAIL_PASSWORD
        }
    });
	var rand = crypto.randomBytes(2).toString('hex');
	var newVerification = {  
		username: user.username,
		verification: rand
	};
	
	return Verification.findAll({attributes:['username'],
		where: {username: newVerification.username}
	})
	.then(function(foundVerifications) {
		if (foundVerifications.length >0) { //a verify link already exists for this user (either a email verification or another reset link)
			return Promise.reject({
				statusCode:400,
				message:'Another verification/reset link has already been sent to your email'
			})
		}
		else {
			jwt.sign({username: newVerification.username,verification: rand},function(err,token){
				var link="http://localhost:8888/auth/resetPassword?token="+token;
				mailOptions={
					to: user.email, 
					subject : "Reset Password",
				html : `Hello ${user.fName},<br><br> Please click on the link to reset your password.<br><a href="${link}">Click here to reset password</a><br><br><i><b>Citron Inc.</b></i>`
				}
				smtpTransport.sendMail(mailOptions)
				.then( response => {
					console.log(rand,'Email sent successfully');
				})
				.catch( err => {
					console.log(err);
				});            
			});
			return Verification.create(newVerification)
				.then (function (data) {
					return Promise.resolve(data);
				})
				.catch(function(err){
					return Promise.reject(err);
				});
		}
	})
	.catch(function(err) {
		return Promise.reject(err);
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

//POST resetPassword: take in token, newPassword and confirmPassword. Reverify the token to get user and verification, destroy verification and update user's password
function resetPassword(passwords) {
    return jwt.verify (passwords.token, function (err, decodedData) {
        if (err) {
            return Promise.reject({
                statusCode: 401,
                message: 'Invalid token'
            });
        } else {
			Verification.destroy({where:{username:decodedData.username}}); //destroy the token correspond to user here
			
            return User.findOne({attributes: ['username'], where:{ username: decodedData.username}})
			.then(function (foundUser) {
				const saltRounds = 10;
				return bcrypt.hash(passwords.newPassword, saltRounds)
				.then( (hash) =>{
					return foundUser.updateAttributes({password:hash}); //update the password hash
				})
				.catch(function(err) {
					return Promise.reject(err);
				});
			})
			.catch(function (err){
				return Promise.reject({
					statusCode: 401,
					message: err.message
				});
			});
		}
	})
}
