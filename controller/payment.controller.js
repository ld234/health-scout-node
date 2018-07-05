var stripe = require('stripe')(process.env.STRIPE_KEY);
var User =require('../model/user.model');

module.exports = {
    charge,
    subscribe
}

function charge(username, stripeToken, bundle) {
    var amount = 0;
    if (bundle === 'standard'){
        amount = 1999;
    }
    else if (bundle === 'premium'){
        amount = 2499;
    }
    else if (bundle === 'platinum'){
        amount = 4999;
    }
    return User.findOne({
        attributes:['email','customerID'],
        where: {
            username : username
        }
    })
    .then ( (user) => {
        if (amount !== 0)
            return stripe.charges.create({
                card: stripeToken,
                currency: 'aud',
                amount: amount,
                receipt_email: user.email,
                description: `Payment for ${bundle} bundle.`
            })
            .then(charge => {
                console.log('Charged');
                return Promise.resolve(charge);
            })
            .catch(err => {
                console.log('failed charge')
                return Promise.reject({statusCode:400, message:"Invalid card."})
            });
        else{
            return Promise.resolve({message: 'No bundle purchased.'});
        }
    })
    .catch( err => Promise.reject(err));
    
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

function subscribe(username,email){
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