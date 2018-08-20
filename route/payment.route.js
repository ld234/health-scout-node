var router = require('express').Router();
const paymentController = require('../controller/payment.controller');

router.put('/', charge);
router.put('/subscribe', subscribe);

module.exports = router;

function charge(req,res,next) {
    console.log('charging');
    const username = req.body.user;
    const stripeToken = req.body.stripeToken;
    const bundle = req.body.bundle;
    paymentController.charge(username,stripeToken,bundle)
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