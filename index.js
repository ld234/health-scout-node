var express = require('express');
var app = express();
var https=require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var userRouter = require('./route/user.route');
var authRouter = require('./route/auth.route');
var paymentRouter = require('./route/payment.route');
var documentRouter = require('./route/document.route');
var searchRouter = require('./route/search.route');

var specialtyRouter = require('./route/specialty.route');
var qualificationRouter = require('./route/qualification.route');
var clientsRouter = require('./route/clients.route');
var patientMedicalDetailsRouter = require('./route/patient.medical.details.route');

var errorHandler = require('./middleware/error-handler');

require('./utils/create.db'); //move RawQuery to here to be called after loading the database
require('./utils/passport');
require('./utils/stripe.plan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.use(express.static('./public'));

const options= {
	key: fs.readFileSync("./utils/sslkeys/private-key.pem"),
	cert: fs.readFileSync("./utils/sslkeys/cert.pem")
}

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/charge', paymentRouter);

app.use('/specialty',specialtyRouter);
app.use('/qualification',qualificationRouter);
app.use('/clients',clientsRouter);
app.use('/document',documentRouter);

//for patients
app.use('/search',searchRouter);
app.use('/patient/medicalDetails',patientMedicalDetailsRouter)

//test geocoder 
/*var NodeGeocoder = require('node-geocoder');
var geoOptions={
	provider: 'google',
	httpAdapter: 'https',
	formatter:null,
	apiKey:'AIzaSyDQEvjV-rvP7DHgpf0IhYBGOrduZkxluNc'
}

var geocoder=NodeGeocoder(geoOptions);
geocoder.geocode('93 Albert St Revesby NSW 2212 Australia', function(err, res) {
  console.log(res);
});*/

app.use(errorHandler.errorHandler());

app.listen(process.env.HTTP_PORT, function () {
    console.log(`HealthScout is listening for incoming requests at: http://localhost:${process.env.HTTP_PORT}`);
})

https.createServer(options,app).listen(process.env.HTTPS_PORT, function(){
	console.log(`HealthScout is listening for incoming requests at: https://localhost:${process.env.HTTPS_PORT}`);
})