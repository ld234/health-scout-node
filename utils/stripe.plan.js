var stripe = require('stripe')(process.env.STRIPE_KEY); //this is the secret key (testing one). When deploy have to change to production one
//prod_D9ok2XQH3yo1n8
stripe.plans.create({ //this is used to create subscriptions
    id: 'healthscout-annual',
    amount: 1999,
    interval: "year",
    product: {
      name: "HealthScout Annual Subscription"
    },
    currency: "aud",
}, function(err, plan) {
    // console.log(plan);
    console.log('Plan created');
});

/*
{ id: 'premium-bundle',
  object: 'product',
  active: true,
  attributes: [],
  caption: null,
  created: 1530528506,
  deactivate_on: [],
  description: null,
  images: [],
  livemode: false,
  metadata: {},
  name: 'Premium Connection Bundle',
  package_dimensions: null,
  shippable: null,
  statement_descriptor: null,
  type: 'service',
  unit_label: null,
  updated: 1530528506,
  url: null }

{ id: 'standard-bundle',
  object: 'product',
  active: true,
  attributes: [],
  caption: null,
  created: 1530528506,
  deactivate_on: [],
  description: null,
  images: [],
  livemode: false,
  metadata: {},
  name: 'Standard Connection Bundle',
  package_dimensions: null,
  shippable: null,
  statement_descriptor: null,
  type: 'service',
  unit_label: null,
  updated: 1530528506,
  url: null }

{ id: 'platinum-bundle',
  object: 'product',
  active: true,
  attributes: [],
  caption: null,
  created: 1530528506,
  deactivate_on: [],
  description: null,
  images: [],
  livemode: false,
  metadata: {},
  name: 'Platinum Connection Bundle',
  package_dimensions: null,
  shippable: null,
  statement_descriptor: null,
  type: 'service',
  unit_label: null,
  updated: 1530528506,
  url: null }

{ id: 'healthscout-annual',
  object: 'plan',
  active: true,
  aggregate_usage: null,
  amount: 1999,
  billing_scheme: 'per_unit',
  created: 1530549786,
  currency: 'aud',
  interval: 'year',
  interval_count: 1,
  livemode: false,
  metadata: {},
  nickname: null,
  product: 'prod_D9ok2XQH3yo1n8',
  tiers: null,
  tiers_mode: null,
  transform_usage: null,
  trial_period_days: null,
  usage_type: 'licensed' }
  */