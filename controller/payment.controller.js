var stripe = require('stripe')(process.env.STRIPE_KEY);
var User =require('../model/user.model');

module.exports = {
    charge,
    subscribe
}

function charge(username, stripeToken) {
    var amount = 2500;
    return User.findOne({
        attributes:['email'],
        where: {
        username : username
    }})
    .then ( (user) => {
        return stripe.charges.create({
            card: stripeToken,
            currency: 'aud',
            amount: amount,
            receipt_email: user.email
        })
        .then(charge => {
            console.log('charged');
            return Promise.resolve(charge);
        })
        .catch(err => {
            console.log('failed charge')
            return Promise.reject({statusCode:400, message:"Invalid card."})
        });
    })
    .catch( err => Promise.resolve(err));
    
}

function createCustomer(user){
    return User.findOne( { attributes:[username, email], where: {
        username : user
    } })
    stripe.customers.create({
        description: `Customer for ${req.email}` ,
        email: req.email
    })
    .then(customer => {
        console.log(customer);
        return Promise.resolve(customer);
    })
    .catch(err => Promise.reject(err));
}

function subscribe(customer){
    return createCustomer (customer)
    .then (customer => {
        return stripe.subscriptions.create({
            customer:  req.body.customer ,
            items: [
                {
                    plan: "healthscout-annual",
                },
            ],
            days_until_due: 30
        })
        .then (subscription => {
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