const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user.model');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
const fs = require('fs');

const cert = fs.readFileSync('utils/key/key.pem');

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
							return done({message: 'Incorrect username or password.'}, false);
						}
						else {
							User.findOne({
								attributes: {
									exclude: ['password','customerID']
								},
								where: {
									username: username
								}
							})
							.then ((newUser) => {
								return done(null, newUser, {message: 'Logged In Successfully'});
							})
							.catch( err => done(err));
						}
					})
					.catch(err => done(err));
				}
				else{
					return done({message: 'This account has not been activated.'}, false);
				}
			}
			else{
				return done({message: "Incorrect username or password."});
			}
		})
		.catch(err => done(err));
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