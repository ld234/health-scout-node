var router = require('express').Router();
const paymentController = require('../controller/payment.controller');

router.post('/', charge);
router.post('/subscribe', subscribe);

module.exports = router;

function charge(req,res,next) {
    console.log('charging');
    const username = req.body.user;
    const stripeToken = req.body.stripeToken;
    paymentController.charge(username,stripeToken)
    .then((charge) => {
        res.status(204).send(charge);
    })
    .catch((err) => {
        next(err);
    })
}

function subscribe(req,res){
    paymentController.subscribe(req.body.user)
    .then ( subscription => res.send(subscription))
    .catch( err => next(err));
}