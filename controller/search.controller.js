const db = require('../utils/create.db');
const Practitioner = db.Practitioner;
const User = db.User;
const NodeGeocoder = require('node-geocoder');

var geoOptions={
	provider: 'google',
	httpAdapter: 'https',
	formatter:null,
	apiKey:'AIzaSyDQEvjV-rvP7DHgpf0IhYBGOrduZkxluNc'
}

var geocoder=NodeGeocoder(geoOptions);
const R = 6371; // km, radius of the earth

module.exports={
	getNearbyPractitioners,
}

function getNearbyPractitioners(searchConditions) {
	return Practitioner.findAll({
		attributes:['pracUsername','pracType','serviceProvided','businessAddress','description','rating'],
		include:[{
			model: User,
			attributes:['title','fName','lName','profilePic'],
			//where: {active: 1}
		}],
	})
	.then(foundPracs =>{
		var nearbyPracs=[];
		return Promise.all(foundPracs.map(function(prac) {
			return filterNearby(prac,nearbyPracs,searchConditions);
		}))
		.then(result=> {
			return Promise.resolve(nearbyPracs);
		});
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function filterNearby(prac,nearbyPracs,searchConditions) {
	return geocoder.geocode(prac.dataValues.businessAddress,function(err,locations){
		if (err) {console.log(err);}
		if (locations.length==1) {
			let lat=locations[0].latitude;
			let lon=locations[0].longitude;
			console.log(lat);
			console.log(lon);
			let d = calculateDistance(lat, lon,searchConditions.latitude, searchConditions.longitude); //km
			console.log(d);
			if (d<=searchConditions.radius) {
				prac.dataValues.distance=d;
				nearbyPracs.push(prac);
				console.log("Found one!");
				return Promise.resolve(prac);
			}
		}
		else { //more than one location is returneds, or none returned
			console.log('Business address is ambiguous. No location, or multiple locations found');
		}
	});
}

function calculateDistance(lat1, lon1,lat2,lon2) {
	var phi1 = toRadians(lat1);
	var phi2 = toRadians(lat2);
	var delta_phi = toRadians(lat2-lat1);
	var delta_lambda = toRadians(lon2-lon1);

	var a = Math.sin(delta_phi/2) * Math.sin(delta_phi/2) +
			Math.cos(phi1) * Math.cos(phi2) *
			Math.sin(delta_lambda/2) * Math.sin(delta_lambda/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d;
}

function toRadians(degrees) {
	return degrees * Math.PI / 180;
}