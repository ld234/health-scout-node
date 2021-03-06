/* * * * * * * * * * * * * * * * * * * * * *
 * @Dan
 * Description: Authentication controller handling authentication logic
 * Created: 10 May 2018
 * Last modified: 15 Aug 2018
 * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const User=db.User;
const Practitioner = db.Practitioner;
const Patient = db.Patient;
const Verification = db.Verification;

const crypto = require('crypto');
const jwt = require('../utils/jwt');
const path = require('path');
const nodemailer = require('nodemailer');
const  hbs = require('nodemailer-express-handlebars');
const bcrypt = require('bcrypt');
require('dotenv').config();

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
    checkAuth,
	checkPracAuth,
	checkPatientAuth,
    verifyEmail,
    sendEmail,
    allowPasswordReset,
    requestPasswordReset,
    resetPassword
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
                        return User.update(
                                { active: 1 },
                                { where: {username: foundUser.dataValues.username} }
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

// Send email to registered user
function sendEmail(user,callback){
	return User.findOne({
		where: {
			username: user.username,
			email: user.email,
			active: false
		}
	})
	.then(fUser=>{
		if (fUser) {
			var rand = crypto.randomBytes(2).toString('hex');
			jwt.sign({username: user.username,verification: rand}, function(err,token){
				var link=`${process.env.ROOT_URL}/verify?id=${token}`;
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
				})
				.catch( err => {
					console.log(err);
				});            
			} ,'3d');
			var newVerification = {  
				username: user.username,
				verification: rand
			};
			return Verification.findOne({
				where: {
					username: newVerification.username
				}
			})
			.then(foundUser=>{
				if (foundUser) {
					return Verification.update({
						verification: newVerification.verification,
					},
					{where: {
						username: newVerification.username
					}})
					.then(numsUpdated=>{
						if (numsUpdated==1) {
							return Promise.resolve(newVerification);
						}
						else {
							return Promise.reject({
								statusCode:400,
								message: 'Unexpected behavior. Cannot update verification of user'
							})
						}
					})
				}
				else {
					return Verification.create(newVerification)
					.then (function (data) {
						return Promise.resolve(data);
					})
					.catch(function(err){
						return Promise.reject(err);
					});
				}
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:400,
				message:'User does not exists or active already/email is incorrect'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

// Check whether username exists. Called by middleware auth.auth()
function checkAuth(user) {
    return User.findOne( {attributes:['username'],where: { username : user.username}})
        .then(function (foundUser) {
            if (foundUser) {
                return Promise.resolve(foundUser);
            } else {
                return Promise.reject({
                    message: 'User Not Found'
                });
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
}

//check whether a practitioner username exists. Called by middleware auth.pracAuth()
function checkPracAuth(user) {
    return Practitioner.findOne( { attributes:['pracUsername'] ,where: { pracUsername : user.username}})
        .then(function (foundPractitioner) { 
            if (foundPractitioner) {
                return Promise.resolve(foundPractitioner);
            } else {
                return Promise.reject({
                    message: 'Practitioner Not Found'
                });
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
}

//check whether a patient username exists. Called by middleware auth.patientAuth()
function checkPatientAuth(user) {
    return Patient.findOne( { attributes:['patientUsername'] ,where: { patientUsername : user.username}})
        .then(function (foundPatient) {
            if (foundPatient) {
                return Promise.resolve(foundPatient);
            } else {
                return Promise.reject({
                    message: 'Patient Not Found'
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
            attributes: ['username','fName','email','active'],
            where: {
                username: username
            }
        })
        .then (foundUser => {
            createResetLink(foundUser,function (err, message){
                if (err)
                    cb(err);
                else
                    cb(null,message);
            })
        })
    }
    else if (email){
        User.findOne({
            attributes: ['username','email','fName','active'],
            where: {
                email: email
            }
        })
        .then (foundUser => {
            createResetLink(foundUser, function(err,data){
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
        if (!foundUser.active){
            cb({
                statusCode: 400,
                message: 'This account has not been activated.'
            })
        }
        else{
            var rand = crypto.randomBytes(10).toString('hex');
            jwt.sign({username: foundUser.username,verification: rand},function(err,token){
                if (!err){
                    console.log(token);
                    var link=`${process.env.ROOT_URL}resetPassword?id=${token}`;
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
                            cb({
                                message: 'Email cannot be sent to your nominated email. Please try again later.'
                            })
                        });
                    })
                    .catch(function(err){
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
            },'3d');
        }
    }
    else{
        cb({
            statusCode: 400,
            message: 'The email or username you provided has not been registered with HealthScout.'
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
                attributes:['username','passwordReset','fName','email'],
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
                        message: 'Invalid reset password link.'
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

