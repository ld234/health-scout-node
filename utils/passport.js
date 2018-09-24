const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../utils/create.db').User;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
const fs = require('fs');

const cert = fs.readFileSync('utils/key/key.pem'); //read in the private key

passport.use(new LocalStrategy(
    function (username, password, done) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT		
		return User.findOne({
			attributes: ['username','password','active'],
			where: {
				username: username
			}
		})
		.then(user => {
			if (user){
				if (user.active){
					return bcrypt.compare(password, user.password)
					.then (res => {
						if (res == false){
							return done(null,false,{message: 'Incorrect username or password.'});
						}
						else {
							User.findOne({
								attributes: {
									exclude: ['password']
								},
								where: {
									username: username
								}
							})
							.then ((newUser) => {
								return done(null, newUser);
							})
							.catch( err => done(err));
						}
					})
					.catch(err => done(err));
				}
				else{ //if user is not active yet (not verified by email)
					return done(null,false,{message: 'This account has not been activated.'});
				}
			}
			else{
				return done(null,false,{message: "Incorrect username or password."});
			}
		})
		.catch(err => done(err)); //server exception occurs, set the error to TRUE
	}
));

// Not working
passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey : cert,
		algorithms: ['RS256']
    },
    function (jwtPayload, cb) {
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return User.findAll({where: {username: jwtPayload.username }})
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));