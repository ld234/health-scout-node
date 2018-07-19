const User = require('../model/user.model');
const Practitioner = require('../model/practitioner.model');
const Qualification = require('../model/qualification.model');
const RegisteredBusiness = require('../model/registered.business.model');
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
    checkPractitionerDetails
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

function checkPractitionerDetails(abn,medicalProviderNumber) { 
    var invalidFields = [];
    return RegisteredBusiness.findOne({ attribute:['ABN'], where : {ABN: abn}})
    .then(foundABN => {
        if (!foundABN){
           invalidFields.push('ABN');
           return Practitioner.findOne({attribute: ['medicalProviderNumber'], where : {medicalProviderNumber: medicalProviderNumber}})
           .then (foundMedProviderNum => {
                if(foundMedProviderNum){
                    invalidFields.push('medicalProviderNumber');
                }
                return Promise.resolve(invalidFields);
           })
           .catch(err => {return Promise.reject(err)});
           
        }
    })
    .catch (err => {return Promise.reject(err)});
}

// Add new user
function createUser(newUser){
    /*var salt = crypto.randomBytes(2).toString('hex');
    var hash = crypto.createHmac('sha256', secret)
        .update(newUser.password.concat(salt))
        .digest('hex');*/
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
                // Store hash in your password DB.
                newUser.password = hash;
                
                return paymentController.subscribe(newUser.username, newUser.email)
                .then (data => {
                    newUser.customerID = data.customer;
                    console.log('successful payment');
                    return User.create(newUser)
                    .then( savedUser => {
                        let hasBundle = false;
                        if (newUser.bundle === 'standard') {
                            newUser.availableConnections =  STANDARD_CONN;
                            hasBundle = true;
                        }
                        else if (newUser.bundle === 'premium'){
                            newUser.availableConnections =  PREMIUM_CONN;
                            hasBundle = true;
                        }
                        else if (newUser.bundle === 'platinum'){
                            newUser.availableConnections =  PLATINUM_CONN;
                            hasBundle = true;
                        }
                        if (hasBundle){
                            console.log('has bundle');
                            return paymentController.charge(newUser.username, newUser.stripeToken, newUser.bundle)
                            .then( charge => {
                                return savePractitioner(newUser)
                                .then ( savedPrac => {
                                    return Promise.resolve(savedUser);
                                })
                                .catch( err => {return Promise.reject(err)});
                            })
                        }
                        else{
                            return savePractitioner(newUser)
                            .then ( savedPrac => {
                                return Promise.resolve(savedPrac);
                            })
                            .catch( err => {return Promise.reject(err)});
                        }
                    })
                    .catch( err => {return Promise.reject(err)});
                })
            })
            .catch(function (err) {
                return Promise.reject(err);
            })
        }
    })
    .catch (err => { return Promise.reject(err) });
}

function savePractitioner(newUser){
    console.log('saving prac')
    newUser.pracUsername = newUser.username;
    return Practitioner.create(newUser)
    .then( data => {
        return authController.sendEmail(newUser)
        .then( (data) => {
            return Promise.resolve(newUser);
        })
        .catch( err => {console.log('sending email err'); return Promise.reject(err); });
    })
    .catch(err => { console.log('create prac err', err); return Promise.reject(err);})
}