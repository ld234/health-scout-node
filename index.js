var express = require('express');
var app = express();
const path = require('path');
var bodyParser = require('body-parser');
var router = express.Router();
var userRouter = require('./route/user.route');
var authRouter = require('./route/auth.route');
var paymentRouter = require('./route/payment.route');

var specialtyRouter = require('./route/specialty.route');
var qualificationRouter = require('./route/qualification.route');

var errorHandler = require('./middleware/error-handler');
require('./db/sql-connection');
require('./utils/create.db');
require('./utils/passport');
require('./utils/stripe.plan');
const cors = require('cors');

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(express.static('./public'));

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/charge', paymentRouter);

app.use('/specialty',specialtyRouter);
app.use('/qualification',qualificationRouter);

app.use(errorHandler.errorHandler());

app.listen(process.env.PORT, function () {
    console.log(`HealthScout is listening for incoming requests at: http://localhost:${process.env.PORT}`);
})