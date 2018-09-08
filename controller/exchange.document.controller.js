const db = require('../utils/create.db');
const Document = db.Document;
const PatientDoctorDocument= db.PatientDoctorDocument;
const Patient = db.Patient;
const ReceivedDocument = db.ReceivedDocument;
const fs = require('fs');

module.exports = {
	getDocumentList,
	sendDocument,
	getOldReceivedDocuments,
	getNewReceivedDocuments,
	seeDocument,
	//getRequestedDocuments
}

const Sequelize=require('sequelize');
const sequelize = new Sequelize('healthscout', process.env.DB_USER, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

function getDocumentList(pracUsername,patientUsername) {
	var sql = 'SELECT Document.title as title, Document.description as description, PatientDoctorDocument.patientUsername as patientUsername '
				+ 'FROM Document LEFT OUTER JOIN PatientDoctorDocument '
				+ 'ON Document.pracUsername=PatientDoctorDocument.pracUsername AND Document.title = PatientDoctorDocument.title '
				+ 'WHERE Document.pracUsername=? AND (PatientDoctorDocument.patientUsername=? OR PatientDoctorDocument.patientUsername IS NULL);';
	return sequelize.query(sql,{replacements: [pracUsername,patientUsername],type: Sequelize.QueryTypes.SELECT})
	.then(rows=>{ //if patientUsername is null, it means the document has not been sent out yet, otherwise it is in sent out (in the table) already
		console.log(rows);
		for (let i=0; i< rows.length; i++) {
			if (!rows[i].patientUsername) { //if patientUsername is null
				rows[i].status="Send";
			}
			else {
				rows[i].status="Delivered";
			}
		}
		return Promise.resolve(rows);
	})
	.catch(err=>{
		console.log(err);
		return Promise.reject(err);
	})
}

function sendDocument(document) {
	return Patient.findOne({
		where: {patientUsername: document.patientUsername}
	})
	.then(patient=>{
		if (patient) {
			return Document.findOne({
				where: [
					{pracUsername: document.pracUsername},
					{title: document.title}
				]
			})
			.then(foundDocument=>{
				if (foundDocument) {
					return PatientDoctorDocument.findOne({
						where:[
							{pracUsername: document.pracUsername},
							{patientUsername: document.patientUsername},
							{title: document.title}
						]
					})
					.then(foundRecord=>{
						if (foundRecord) {
							return Promise.reject({
								statusCode:400,
								message: 'Document already exists'
							})
						}
						else { //not found, meaning it's not a pending document yet. We add it to the model
							return PatientDoctorDocument.create(document)
							.then(createdDocument=>{
								return Promise.resolve(createdDocument);
							})
							.catch(err=>{
								return Promise.reject(err);
							})
						}
					})
				}
				else {
					return Promise.reject({
						statusCode:404,
						message: 'Document not found'
					})
				}
			})
			.catch(err=>{
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Patient username not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function getNewReceivedDocuments(pracUsername, patientUsername) {
	return ReceivedDocument.findAll({
		where: [
			{pracUsername: pracUsername},
			{patientUsername: patientUsername},
			{status: false} //have not seen
		],
		order: [
			['receivedDate','DESC']
		]
	})
	.then(foundDocuments=>{
		return Promise.resolve(foundDocuments);
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function getOldReceivedDocuments(pracUsername, patientUsername) {
	return ReceivedDocument.findAll({
		where: [
			{pracUsername: pracUsername},
			{patientUsername: patientUsername},
			{status: true} //have seen
		],
		order: [
			['receivedDate','DESC']
		]
	})
	.then(foundDocuments=>{
		return Promise.resolve(foundDocuments);
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

function seeDocument(document) {
	return ReceivedDocument.findOne({
		where: [
			{pracUsername: document.pracUsername},
			{patientUsername: document.patientUsername},
			{title: document.title}
		]
	})
	.then(foundDocument=>{
		if (foundDocument) {
			if (!foundDocument.status) { //if this is a new received document (unseen)
				ReceivedDocument.update({
					status:true,
				},{
					where: {
						pracUsername: document.pracUsername,
						patientUsername: document.patientUsername,
						title: document.title
					}
				})
				.then(rowsUpdated=>{
					if (rowsUpdated==1) {
						return fs.createReadStream('.'+foundDocument.receivedLink)
						.then(stream=>{
							return Promise.resolve(stream);
						})
						.catch(err=>{
							return Promise.reject({
								statusCode:404,
								message: 'Cannot find the specified document'
							})
						})
					}
					else {
						return Promise.reject({
							statusCode:400,
							message: 'Unexpected behavior. No document updated or multiple documents updated'
						})
					}
				})
				.catch(err=>{
					return Promise.reject(err);
				})
			}
			else { //no need to update
				return fs.createReadStream('.'+foundDocument.receivedLink)
				.then(stream=>{
					return Promise.resolve(stream);
				})
				.catch(err=>{
					return Promise.reject({
						statusCode:404,
						message: 'Cannot find the specified document'
					})
				})
			}
		}
		else {
			return Promise.reject({
				statusCode:404,
				message: 'Document not found'
			})
		}
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

/*function getRequestedDocuments(patientUsername) {
	var sql='SELECT PatientDoctorDocument.title as title, Document.description as description, Document.file as file, PatientDoctorDocument.pracUsername as pracUsername, '
			+ 'CONCAT(User.title," ",User.fName," ",User.lName,", ", Practitioner.pracType) FROM PatientDoctorDocument JOIN Document '
			+ 
}*/