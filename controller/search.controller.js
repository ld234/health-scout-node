/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: Search prac by criteria
 * Created: 3 Oct 2018
 * Last modified: 14 Oct 2018
 * * * * * * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Practitioner = db.Practitioner;
const User = db.User;
const Specialty=db.Specialty;
const NodeGeocoder = require('node-geocoder');

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: true,
});

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
	getPractitionersByTypeAndSpecialty,
}

function getPractitionersByTypeAndSpecialty(pracType,specialties,patientUsername) {
	if (pracType && specialties.length>0) {
		var sql = 'select p.pracUsername,p.pracType,p.serviceProvided,p.businessAddress,p.description,p.rating,'
				+ 'u.title,u.fName,u.lName,u.profilePic,s.specialty '
				+ 'from Practitioner p join User u on p.pracUsername=u.username '
				+ 'join Specialty s on p.pracUsername=s.pracUsername '
				+ 'where p.pracType=? and s.specialty in (?) '
				+ 'and p.pracUsername not in '
				+ '(select pracUsername from PatientDoctorRelation where patientUsername=?);';
		return sequelize.query(sql,{replacements:[pracType,specialties,patientUsername],type:Sequelize.QueryTypes.SELECT})
		.then(foundPracs=>{
			return Promise.resolve(foundPracs);
		})
		.catch(err=>{
			return Promise.reject(err);
		})
	}
	else if (specialties.length==0) { //no specialty provided with the search
		var sql = 'select p.pracUsername,p.pracType,p.serviceProvided,p.businessAddress,p.description,p.rating,'
				+ 'u.title,u.fName,u.lName,u.profilePic,s.specialty '
				+ 'from Practitioner p join User u on p.pracUsername=u.username '
				+ 'join Specialty s on p.pracUsername=s.pracUsername '
				+ 'where p.pracType=? '
				+ 'and p.pracUsername not in '
				+ '(select pracUsername from PatientDoctorRelation where patientUsername=?);';
		return sequelize.query(sql,{replacements:[pracType,patientUsername],type:Sequelize.QueryTypes.SELECT})
		.then(foundPracs=>{
			return Promise.resolve(foundPracs);
		})
		.catch(err=>{
			return Promise.reject(err);
		})
	}
	else if (!pracType) { //pracType is not provided with the search
		var sql = 'select p.pracUsername,p.pracType,p.serviceProvided,p.businessAddress,p.description,p.rating,'
				+ 'u.title,u.fName,u.lName,u.profilePic,s.specialty '
				+ 'from Practitioner p join User u on p.pracUsername=u.username '
				+ 'join Specialty s on p.pracUsername=s.pracUsername '
				+ 'where p.specialty in (?) '
				+ 'and p.pracUsername not in '
				+ '(select pracUsername from PatientDoctorRelation where patientUsername=?);';
		return sequelize.query(sql,{replacements:[specialties,patientUsername],type:Sequelize.QueryTypes.SELECT})
		.then(foundPracs=>{
			return Promise.resolve(foundPracs);
		})
		.catch(err=>{
			return Promise.reject(err);
		})
	}
}

function getNearbyPractitioners(searchConditions) {
	var sql = 'select p.pracUsername,p.pracType,p.serviceProvided,p.businessAddress,p.description,p.rating,'
				+ 'u.title,u.fName,u.lName,u.profilePic '
				+ 'from Practitioner p join User u on p.pracUsername=u.username '
				+ 'where p.pracUsername not in '
				+ '(select pracUsername from PatientDoctorRelation where patientUsername=?);';
	return sequelize.query(sql,{replacements:[searchConditions.patientUsername],type:Sequelize.QueryTypes.SELECT})
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
	return geocoder.geocode(prac.businessAddress,function(err,locations){
		if (err) {console.log(err);}
		if (locations.length==1) {
			let lat=locations[0].latitude;
			let lon=locations[0].longitude;
			let d = calculateDistance(lat, lon,searchConditions.latitude, searchConditions.longitude); //km
			if (d<=searchConditions.radius) {
				prac.distance=d;
				nearbyPracs.push(prac);
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