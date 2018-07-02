var router = require('express').Router();
var stripe = require('stripe')(process.env.STRIPE_KEY);

router.post('/onetime', charge);
router.post('/subscribe', createCustomer);

module.exports = router;

function charge(req, res) {
    var stripeToken = req.body.stripeToken;
    var amount = 2500;
    stripe.charges.create({
        card: stripeToken,
        currency: 'aud',
        amount: amount
    },
    function(err, charge) {
        if (err) {
            res.status(400).send({message:"Invalid card."});
        } else {
            res.status(204).send(charge);
        }
    });
}

function createCustomer(req,res){
    stripe.customers.create({
        description: `Customer for ${req.email}` ,
        email: req.email
    }, function(err, customer) {
        req.body.customer = customer.id;
        subscribe(req,res);
    });
}

function subscribe(req,res){
    stripe.subscriptions.create({
        customer: req.username ,
        items: [
            {
                plan: "healthscout_annual",
            },
        ],
        days_until_due: 30
    },  function(err, subscription) {
            // asynchronously called
        }
    );
}