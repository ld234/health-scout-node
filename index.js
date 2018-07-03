var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var userRouter = require('./route/user.route');
var authRouter = require('./route/auth.route');
var paymentRouter = require('./route/payment.route');

var errorHandler = require('./middleware/error-handler');
require('./db/sql-connection');
require('./model/user.model');
require('./model/verification.model');

const path = require('path');
require('./utils/passport');
const cors = require('cors')
require('./utils/stripe.plan');

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(express.static('./public'));

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/charge', paymentRouter);

app.use(errorHandler.errorHandler());

app.listen(process.env.PORT, function () {
    console.log(`HealthScout is listening for incoming requests at: http://localhost:${process.env.PORT}`);
})