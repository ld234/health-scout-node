var stripe = require('stripe')(process.env.STRIPE_KEY);
const db = require('../utils/create.db');
const User=db.User;
const Practitioner=db.Practitioner;

const STANDARD_CONN = 10;
const PREMIUM_CONN = 20;
const PLATINUM_CONN = 50;

module.exports = {
    pracCharge,
    subscribe
}

function pracCharge(pracUsername, stripeToken, bundle) { //charge after registration
    var amount = 0;
	var addedConn=0;
    if (bundle === 'standard'){
        amount = 1999;
		addedConn=STANDARD_CONN;
    }
    else if (bundle === 'premium'){
        amount = 2499;
		addedConn=PREMIUM_CONN;
    }
    else if (bundle === 'platinum'){
        amount = 4999;
		addedConn=PLATINUM_CONN;
    }
	if (amount!==0) {
		return User.findAll({
			attributes:['email'],
			where: {username: pracUsername}
		})
		.then(users=> {
			return stripe.charges.create({
				source: stripeToken,
				currency: 'aud',
				amount: amount,
				receipt_email: users[0].email,
				description: `Payment by ${pracUsername} for ${bundle} bundle.`
			})
			.then(charge => {
				console.log('Charged');
				return Practitioner.findOne({
					where: {pracUsername:pracUsername}
				})
				.then(foundPractitioner=>{
					console.log(foundPractitioner);
					if (foundPractitioner) { //this practitioner purchase the bundle after the registration step, so he's already in the system and have access-token => is active
						return Practitioner.increment({availableConnections: addedConn},{where: {pracUsername: pracUsername} })
						.then(data=>{
							return Promise.resolve(data);
						})
						.catch(err=>{
							return Promise.reject(err);
						})
					}
					else { //if not found practitioner, means this charge is in the process of creating practitioner, don't do anything, let the parent code take care
						return Promise.resolve(charge);
					}
				})
				.catch(err=>{
					return Promise.reject(err);
				})
			})
			.catch(err => {
				//console.log('failed charge')
				//return Promise.reject({statusCode:400, message:"Invalid card."})
				return Promise.reject(err);
			});
		})
		.catch(err=> {
			return Promise.reject(err);
		})
	}
	else {
		return Promise.resolve({message: 'No bundle purchased.'});
	}
}

function createCustomer(username,email){
    return stripe.customers.create({
        description: `HealthScout customer ${username} with email ${email}`,
        email: email
    })
    .then(customer => {
        return Promise.resolve(customer);
    })
    .catch(err => { return Promise.reject(err)} );
}

function subscribe(username,email){ //for a practitioner to subscribe to one of the plans (bundles)
    return createCustomer (username,email)
    .then (customer => {
        return stripe.subscriptions.create({
            customer:  customer.id ,
            items: [
                {
                    plan: "healthscout-annual",
                },
            ],
            days_until_due: 7,
            billing:'send_invoice'
        })
        .then (subscription => {
            console.log('subscription created');
            return Promise.resolve(subscription);
        })
        .catch( err =>{
            return Promise.reject(err)
        });
    })
    .catch( err => { 
        console.log(err);
        return Promise.reject(err);
    });
}