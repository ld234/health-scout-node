var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var userRouter = require('./route/user.route');
var authRouter = require('./route/auth.route');
var paymentRouter = require('./route/payment.route');
var errorHandler = require('./middleware/error-handler');
var db = require('./db/sql-connection');
var User = require('./model/user.model');
var Verification = require('./model/verification.model');
var path = require('path');
require('./utils/passport');
const passport = require('passport');
const cors = require('cors')

app.use(cors())


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(express.static('./public'));


app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/charge', paymentRouter);

app.use(errorHandler.errorHandler());

app.listen(8888, function () {
    console.log("HealthScout is listening for incoming requests at: http://localhost:8888");
})