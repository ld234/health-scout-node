var router = require('express').Router();

router.post('/', charge);

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
            res.status(500).send({message:"Invalid card."});
        } else {
            res.status(204).send(charge);
        }
    });
}