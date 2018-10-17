var stripe = require('stripe')(process.env.STRIPE_KEY); //this is the secret key (testing one). When deploy have to change to production one

stripe.plans.create({ //this is used to create subscriptions
    id: 'healthscout-annual',
    amount: 1999,
    interval: "year",
    product: {
      name: "HealthScout Annual Subscription"
    },
    currency: "aud",
}, function(err, plan) {
    console.log('Plan created');
});