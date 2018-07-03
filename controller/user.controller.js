var User = require('../model/user.model');
const Op = require('sequelize').Op;
var nodemailer = require("nodemailer");
var crypto = require('crypto');
var authController = require('./auth.controller');
var bcrypt = require('bcrypt');

module.exports = {
    getUser: getUser,
    createUser: createUser,
    // updateUser: updateUser
} 

// Get user info
function getUser(u) {
    return User.findOne({attributes:{ exclude:['password']},where:{username:u}})
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

// Add new user
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
                /*var salt = crypto.randomBytes(2).toString('hex');
                var hash = crypto.createHmac('sha256', secret)
                    .update(newUser.password.concat(salt))
                    .digest('hex');*/
				const saltRounds = 10;
				return bcrypt.hash(newUser.password, saltRounds)
				.then( (hash) =>{
				  // Store hash in your password DB.
					newUser['password'] = hash;
					console.log('new user', newUser);
					let dateParts = newUser.dob.split('-');
					newUser.dob = "".concat(dateParts[2],'-', dateParts[1],'-',dateParts[0]);
					return User.create(newUser)
					.then( savedUser => {
						return authController.sendEmail(savedUser)
						.then( (data) => {
							//delete savedUser.dataValues['password'];
							console.log('usersaved', savedUser.dataValues);
							return Promise.resolve(savedUser.dataValues);
						} )
						.catch( err => {
							return Promise.reject(err);
						} );
					});
				});
                //newUser.salt = salt;
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        })
}