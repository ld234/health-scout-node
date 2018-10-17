var router = require('express').Router();
var auth = require('../middleware/auth');
const paymentController = require('../controller/payment.controller');

router.put('/', auth.auth(),auth.pracAuth(), pracCharge);
//router.put('/', auth.auth(),auth.patientAuth(), patientCharge);
router.put('/subscribe', subscribe);

module.exports = router;

function pracCharge(req,res,next) {
    const pracUsername = req.user;
	if (!req.body.stripeToken) {
		next({
			statusCode:400,
			message: 'Credit card information is required'
		})
	}
	else if (!req.body.bundle) {
		next({
			statusCode:400,
			message: 'A Bundle is required'
		})
	}
	else {
		const stripeToken = req.body.stripeToken;
		const bundle = req.body.bundle;
		paymentController.pracCharge(pracUsername,stripeToken,bundle)
		.then((charge) => {
			res.status(204).send(charge); //with status 204, no content will be sent back
		})
		.catch((err) => {
			next(err);
		})
	}
}

function subscribe(req,res,next){
    paymentController.subscribe(req.body.user)
    .then ( subscription => res.send(subscription))
    .catch( err => next(err));
}