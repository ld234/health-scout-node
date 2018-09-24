const db = require('../utils/create.db');
const User=db.User;
const Practitioner = db.Practitioner;
const RegisteredBusiness=db.RegisteredBusiness;
const Op = require('sequelize').Op;
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const authController = require('./auth.controller');
const bcrypt = require('bcrypt');
const paymentController = require('./payment.controller');
const RawQuery = require('../utils/raw.query');

const STANDARD_CONN = 10;
const PREMIUM_CONN = 20;
const PLATINUM_CONN = 50;

module.exports = {
    getUser: getUser,
    createUser: createUser,
    checkUserDetails: checkUserDetails,
    checkPractitionerDetails,
	createPractitioner,
    // updateUser: updateUser
} 


// Get user info
function getUser(u) {
    return RawQuery.getPractitionerDetails(u)
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

function checkUserDetails(newUser){
    let invalidFields = []; 
    return User.findAll({ 
        attributes:['username','password','email'], 
            where:{
                [Op.or]: [
                    {username:newUser.username},
                    {email:newUser.email}
                ]
            }
        })
        .then( (foundUsers) => {
            foundUsers.map(user => {
                if (user.username === newUser.username)
                    invalidFields.push('username');
                if (user.email === newUser.email)
                    invalidFields.push('email');
            })
            return Promise.resolve(invalidFields);
        })
        .catch( err => {return Promise.reject(err)}); 
        
}

function checkPractitionerDetails(business,medicalProviderNumber) { 
    var invalidFields = [];
	// console.log(business);
    return RegisteredBusiness.findOne({ attribute:['ABN',], where : {ABN: business.abn}})
    .then(foundABN => {
        if (!foundABN){ //if abn cannot be found among those in RegisteredBusiness, that means an error
            invalidFields.push('ABN');
        }
		return Practitioner.findOne({attribute: ['medicalProviderNum'], where : {medicalProviderNum: medicalProviderNumber}})
		.then (foundMedProviderNum => {
			if(foundMedProviderNum){ //if another medical provider number already registers with the same num, must be an error
				invalidFields.push('medicalProviderNum');
			}
			return Promise.resolve(invalidFields);
		})
		.catch(err => {return Promise.reject(err)});
    })
    .catch (err => {return Promise.reject(err)});
}

// create a new user. call saveUser(newUser)
function createUser(newUser) { //after saving the user to database, we send a verification email to finish the registration process
	return saveUser(newUser)
	.then(savedUser=> {
		delete savedUser.dataValues.password; //we don't want to send back the password to front end
		return authController.sendEmail(savedUser)
		.then( (data) => {
			return Promise.resolve(savedUser);
		})
		.catch( err => {console.log('cannot insert to verification table'); return Promise.reject(err); }); //if email cannot be sent, only logging the error to console
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}

//create a new Practitioner. Also call saveUser(newPrac), and then savePractitioner.
function createPractitioner(newPrac) {
	return saveUser(newPrac)
	.then (savedUser=> {
		return paymentController.subscribe(newPrac.username, newPrac.email)
		.then(data=> {
			newPrac.customerID=data.customer;
			console.log('Successfully subscribe practitioner '+newPrac.username+' with customerID: '+newPrac.customerID);
			let hasBundle = false;
			if (newPrac.bundle=== 'standard') {
				newPrac.availableConnections =  STANDARD_CONN;
                hasBundle = true;
			}
			else if(newPrac.bundle=== 'premium') {
				newPrac.availableConnections =  PREMIUM_CONN;
                hasBundle = true;
			}
			else if (newPrac.bundle==='platinum') {
				newPrac.availableConnections =  PLATINUM_CONN;
                hasBundle = true;
			}
			else {
				newPrac.availableConnections=0;
			}
			if (hasBundle) {
				console.log('Customer '+newPrac.customerID+' wants bundle ' + newPrac.bundle);
			}
			else {
				console.log('Customer '+newPrac.customerID+' does not want a bundle');
			}
			return paymentController.pracCharge(newPrac.username, newPrac.stripeToken, newPrac.bundle)
			.then( charge => { //this can be no charge if the practitioner does not select a bundle
				return savePractitioner(newPrac)
				.then ( savedPrac => {
					return Promise.resolve(savedPrac);
				})
				.catch( err => {
					User.destroy({ //if the registration process is not successful, we want to remove the user out of the database as well
						where: {username: newPrac.username}
					});
					return Promise.reject(err)
				});
			})
			.catch(err=>{
				User.destroy({ //if the registration process is not successful, we want to remove the user out of the database as well
					where: {username: newPrac.username}
				});
				return Promise.reject(err)
			})
		})
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}

// Save the user to the database.
function saveUser(newUser){
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
        } else if (!newUser.password.match('^(?=.{8,})(?=.*[0-9].*)(?=.*[A-Za-z].*).*$')){
            return Promise.reject({
                statusCode: 400,
                message: 'Password must contain both letters and digits.'
            });
        } else {
            const saltRounds = 10;
            return bcrypt.hash(newUser.password, saltRounds)
            .then( (hash) =>{
                // Store hash in your password DB instead of the plaintext password
                newUser.password = hash;
                return User.create(newUser)
				.then(savedUser=> {
					return Promise.resolve(savedUser);
				})
            })
            .catch(function (err) {
                return Promise.reject(err);
            })
        }
    })
    .catch (err => { return Promise.reject(err) });
}

//actually saving the practitioner to the database and send verification email to complete the process.
function savePractitioner(newPrac){
    console.log('saving practitioner '+ newPrac.username);
    newPrac.pracUsername = newPrac.username;
    return Practitioner.create(newPrac)
    .then( savedPrac => {
        return authController.sendEmail(newPrac) //have to use newPrac here because we need the username attribute, savedPrac don't have this.
        .then( (data) => {
            return Promise.resolve(savedPrac);
        })
        .catch( err => {
			console.log('sending email err'); return Promise.reject(err); 
		});
    })
    .catch(err => {
		console.log('create prac err', err); return Promise.reject(err);
	})
}