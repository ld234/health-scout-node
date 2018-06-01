var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var userRouter = require('./route/user.route');
var authRouter = require('./route/auth.route');
var errorHandler = require('./middleware/error-handler');
var db = require('./db/sql-connection');
var User = require('./model/user.model');
var Verification = require('./model/verification.model');
var Practitioner = require('./model/practitioner.model');
var Qualification = require('./model/qualification.model');
var Specialty = require('./model/specialty.model');
var Patient = require('./model/patient.model');
var PatientRelation = require('./model/patient.relation.model');
var PatientAllergy = require('./model/patient.allergy.model');
var Consultation = require('./model/consultation.model');
var Testimonial = require('./model/testimonial.model');
var HealthGoalCondition = require('./model/health.goal.condition.model');
var path = require('path');
var stripe = require('stripe')('sk_test_UC9a3zmYliiPfthmAmNg3FtV');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(express.static('./public'));

// Payment
app.post('/charge', function(req, res) {
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
});

app.use('/user', userRouter);
app.use('/auth', authRouter);

app.use(errorHandler.errorHandler());

app.listen(8888, function () {
    console.log("HealthScout is listening for incoming requests at: http://localhost:8888");
})