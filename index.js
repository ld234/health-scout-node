var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var userRouter = require('./route/user.route');
var authRouter = require('./route/auth.route');
var paymentRouter = require('./route/payment.route');
var documentRouter = require('./route/document.route');

var specialtyRouter = require('./route/specialty.route');
var qualificationRouter = require('./route/qualification.route');
var clientsRouter = require('./route/clients.route');

var errorHandler = require('./middleware/error-handler');

require('./utils/create.db'); //move RawQuery to here to be called after loading the database
require('./utils/passport');
require('./utils/stripe.plan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.use(express.static('./public'));

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/charge', paymentRouter);

app.use('/specialty',specialtyRouter);
app.use('/qualification',qualificationRouter);
app.use('/clients',clientsRouter);
app.use('/document',documentRouter);

app.use(errorHandler.errorHandler());

app.listen(process.env.PORT, function () {
    console.log(`HealthScout is listening for incoming requests at: http://localhost:${process.env.PORT}`);
})