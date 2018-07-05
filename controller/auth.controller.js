const User = require('../model/user.model');
const Verification = require('../model/verification.model');
const crypto = require('crypto');
const jwt = require('../utils/jwt');
const path = require('path');
const nodemailer = require('nodemailer');
const  hbs = require('nodemailer-express-handlebars');
const bcrypt = require('bcrypt');
require('dotenv').config()

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAILER_EMAIL_ID,
        pass: process.env.MAILER_EMAIL_PASSWORD
    }
});

var handlebarsOptions = {
    viewEngine: 'handlebars',
    viewPath: path.resolve(__dirname,'../templates/'),
    extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

module.exports = {
    // login,
    checkAuth,
    verifyEmail,
    sendEmail,
    allowPasswordReset,
    requestPasswordReset,
    resetPassword
}

// Outdated
/* function login(username, password) {
    return User.findOne({ attributes:['username','password','active'] ,where: {
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
*/

// Verify the link from the email
function verifyEmail(token){
    return jwt.verify (token, function (err, decodedData) {
        if (err) {
            return Promise.reject({
                statusCode: 401,
                message: 'Invalid token'
            });
        } else {
            return Verification.findOne({
                    where:{
                        username:decodedData.username,
                        verification: decodedData.verification
                    }
                })
            .then ((ver) => {
                if (ver){
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
                else{
                    return Promise.reject({
                        statusCode: 400,
                        message: `Your email ${foundUser.email} cannot be verified.`
                    })
                }
            })
            
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
    var rand = crypto.randomBytes(2).toString('hex');
    jwt.sign({username: user.username,verification: rand}, function(err,token){
        var link="http://localhost:8888/verify?id="+token;
        mailOptions={
            to: user.email, 
            subject : "Welcome to HealthScout",
            template : 'registration-verification-email',
            context: {
                fName: user.fName,
                url: link
            }        
        }
        smtpTransport.sendMail(mailOptions)
		.then( response => {
			console.log(rand,'email sent successfully');
		})
		.catch( err => {
			console.log(err);
        });            
    } ,'3d');
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

function requestPasswordReset(username, email , cb){
    if (username){
        User.findOne({
            attributes: ['username','fName','email'],
            where: {
                username: username
            }
        })
        .then (foundUser => {
            createResetLink(foundUser,function (err, message){
                console.log( 'create reset link callback');
                if (err)
                    cb(err);
                else
                    cb(null,message);
            })
        })
    }
    else if (email){
        User.findOne({
            attributes: ['username','email','fName'],
            where: {
                email: email
            }
        })
        .then (foundUser => {
            createResetLink(foundUser, function(err,data){
                console.log( 'create reset link callback');
                if (err)
                    cb(err);
                else
                    cb(null, data);
            })
                  
        })
              
    }
}

function createResetLink(foundUser,cb){
    if (foundUser){
        console.log('found user email', foundUser.email);
        var rand = crypto.randomBytes(10).toString('hex');
        jwt.sign({username: foundUser.username,verification: rand},function(err,token){
            if (!err){
                console.log(token);
                var link=`http://localhost:${process.env.PORT}/forgotPassword?id=${token}`;
                mailOptions={
                    from: 'HealthScout',
                    to: foundUser.email, 
                    subject : "Reset your HealthScout password",
                    template: 'forgot-password-email',
                    context: {
                        url: link,
                        name: foundUser.fName
                    }
                }
                User.update({passwordReset:rand}, {where: { username: foundUser.username }})
                .then (function (data) {
                    smtpTransport.sendMail(mailOptions)
                    .then( response => {
                        cb(null, {
                            message: 'An email with instructions to reset password has been sent to your nominated email.'
                        })
                    })
                    .catch( err => {
                        console.log('err2',err)
                        cb({
                            message: 'Email cannot be sent to your nominated email. Please try again later.'
                        })
                    });
                })
                .catch(function(err){
                    console.log('err1',err)
                    cb({
                        message: 'Email cannot be sent to your nominated email. Please try again later.'
                    })
                });
            }
            else{
                cb({
                    message: 'Cannot reset password.'
                })
            }
        });
    }
    else{
        cb({
            statusCode: 400,
            message: 'The email you provided has not been registered with HealthScout.'
        })
    }
}

function resetPassword(newPassword, token){
    if (!newPassword.match('^(?=.{8,})(?=.*[0-9].*)(?=.*[A-Za-z].*).*$')){
        return Promise.reject({statusCode: 400, message: 'Invalid password'})
    }
    return jwt.verify (token, function (err, decodedData) {
        if (err) {
            return Promise.reject({
                statusCode: 401,
                message: err.message
            });
        } else {
            return User.findOne({
                attributes:['username','passwordReset','fName'],
                where:{
                    username:decodedData.username,
                    passwordReset: decodedData.verification
                }
            })
            .then ((foundUser) => {
                if (foundUser){
                    const saltRounds = 10;
                    return bcrypt.hash(newPassword, saltRounds)
                    .then( (hash) => {
                        // Store hash in your password DB.
                        
                        return User.update({
                            passwordReset : null, 
                            password: hash
                        }, 
                        {
                            where:{
                                username:foundUser.username
                            }
                        })
                        .then (updatedUser => {
                            mailOptions={
                                from: 'HealthScout',
                                to: foundUser.email, 
                                subject : "Successful HealthScout password reset",
                                template: 'reset-password-email',
                                context: {
                                    name: foundUser.fName
                                }
                            }
                            smtpTransport.sendMail(mailOptions)
                            .then( response => {
                                console.log('Reset email sent.')
                            })
                            .catch( err => {
                                console.log('reset email error', err);
                            });
                            return Promise.resolve({
                                statusCode: 200
                            });
                        })
                        .catch( (err) => {
                            return Promise.reject(err);
                        });
                    })
                    .catch(err => {return Promise.reject(err)})
                }else{
                    return Promise.reject({
                        statusCode: 400,
                        message: 'Cannot reset password.'
                    });
                }
            })
        }
    });
}

function allowPasswordReset(token){
    return jwt.verify (token, function (err, decodedData) {
        if (err) {
            return Promise.reject({
                statusCode: 401,
                message: err.message
            });
        } else {
            return User.findOne({
                    attributes:['username','passwordReset'],
                    where:{
                        username:decodedData.username,
                        passwordReset: decodedData.verification
                    }
                })
            .then ((foundPasswordReset) => {
                if (foundPasswordReset){
                    return User.update({passwordReset : null}, {where:{username:foundPasswordReset.username}})
                    .then (updatedUser => {
                        return Promise.resolve({
                            valid: true
                        })
                    })
                    .catch(function (err) {
                        return Promise.reject({
                            message: err.message,
                            valid: false
                        })
                    });
                }
                else{
                    return Promise.reject({
                        statusCode: 400,
                        valid: false,
                        message: 'The link is invalid.'
                    })
                }
            })
        }
    })
}

