var stripe = require('stripe')(process.env.STRIPE_KEY);

stripe.products.create({
    id: 'standard-bundle',
    name: 'Standard Connection Bundle',
    type: 'service',
}, function(err, product) {
    console.log(product);
});

stripe.products.create({
    id: 'premium-bundle',
    name: 'Premium Connection Bundle',
    type: 'service',
}, function(err, product) {
    console.log(product);
});

stripe.products.create({
    id: 'platinum-bundle',
    name: 'Platinum Connection Bundle',
    type: 'service',
}, function(err, product) {
    console.log(product);
});

stripe.plans.create({
    id: 'healthscout-annual',
    amount: 19.99,
    interval: "year",
    product: {
      name: "HealthScout Annual Subscription"
    },
    currency: "aud",
}, function(err, plan) {
    console.log(plan);
});