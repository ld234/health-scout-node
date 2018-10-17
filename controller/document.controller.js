/* * * * * * * * * * * * * * * * * * * * * *
 * @Kevin
 * Description: Document contoller get doc list, add, update, and delete doc
 * Created: 16 Aug 2018
 * Last modified: 29 Sep 2018
 * * * * * * * * * * * * * * * * * * * * * */
const db = require('../utils/create.db');
const Document = db.Document;
const Practitioner = db.Practitioner;
const moment = require('moment');
var Op = require('sequelize').Op;
const fs =require('fs');

var authController = require('./auth.controller');

module.exports= {
	getDocuments,
	//getDocument,
	addDocument,
	updateDocument,
	deleteDocument
}

function getDocuments(pracUsername) {
	return Document.findAll({
		where: {pracUsername: pracUsername}
	})
	.then(foundDocuments=> {
		return Promise.resolve({documents:foundDocuments});
	})
	.catch(err=>{
		return Promise.reject(err);
	})
}

/*function getDocument(pracUsername, title) {
	return Document.findOne({
		attributes: ['file'],
		where: [
			{pracUsername: pracUsername},
			{title: title}
		]
	})
	.then(document=> {
		if (document) {
			var stream = fs.createReadStream('./public'+document.file); //./ because the current directory is the one index.js are in
			return Promise.resolve(stream);
		}
		else {
			return Promise.reject({
				statusCode: 400,
				message: 'Cannot find the file with corresponding title'
			})
		}
	})
}*/

function addDocument(newDocument) {
	return Document.findAll({
		attributes: ['pracUsername','title'],
		where: [
			{pracUsername: newDocument.pracUsername},
			{title: newDocument.title}
		]
	})
	.then(foundDocuments => {
		if (foundDocuments.length>0) {
			return Promise.reject({
				statusCode:400,
				message: 'Document with the same title already existed'
			})
		}
		else {
			var pathComps = newDocument.file.split('/'); //seperates into ['tmp','hqh719','file.pdf']
			pathComps[1]= 'documents'; //pathComps[0] is an empty string because the link begins with '/' => 'tmp' is pathComps[1]
			var fileNames=pathComps[pathComps.length-1].split('.'); //seperate into ['file','pdf']
			//replace 'file' with the document title, then attach .pdf
			newDocument.file = pathComps.slice(0,-1).join('/') + '/'+ newDocument.title+ '.'+ fileNames[fileNames.length-1];
			newDocument.lastModified=moment();
			return Document.create(newDocument);
		}
	})
	.catch(err => {
		return Promise.reject(err);
	})
}

function deleteDocument(deletedDocument) {
	return Document.findOne({
		attributes: ['pracUsername','title','file'],
		where: [
			{pracUsername: deletedDocument.pracUsername},
			{title: deletedDocument.title}
		]
	})
	.then(foundDocument => {
		if (foundDocument) {
			return Document.destroy({
				where: [
					{pracUsername: deletedDocument.pracUsername},
					{title: deletedDocument.title}
				]
			})
			.then(numOfDestroyed => {
				if (numOfDestroyed==1) {
					return Promise.resolve(foundDocument.file);
				}
				else {
					return Promsie.reject({
						statusCode:400,
						message:'Cannot delete document'
					})
				}
			})
			.catch(err=> {
				return Promise.reject(err);
			})
		}
		else {
			return Promise.reject({
				statusCode:400,
				message:'Document does not exist'
			})
		}
	})
}

function updateDocument(updatedDocument) {
	return Document.findOne({ //has to find and return the old file so that it can be unlinked
		where: [
			{pracUsername: updatedDocument.pracUsername},
			{title: updatedDocument.oldTitle}
		]
	})
	.then(function(foundDocument) {
		if (foundDocument) {
			if (updatedDocument.newTitle !== updatedDocument.oldTitle) { //if newTitle different from oldTitle, we need to update the file link to reflect the change
				var pathComps = foundDocument.file.split('/'); //seperates into ['documents','hqh719','file.pdf']
				var fileNames=pathComps[pathComps.length-1].split('.'); //seperate into ['file','pdf']
				//replace 'file' with the document new title, then attach .pdf
				updatedDocument.file = pathComps.slice(0,-1).join('/') + '/'+ updatedDocument.newTitle+ '.'+ fileNames[fileNames.length-1];
				var curDate=moment();
				updatedDocument.lastModified=curDate;
				return Document.update({
					title: updatedDocument.newTitle,
					description: updatedDocument.description,
					file: updatedDocument.file,
					lastModified: updatedDocument.lastModified,
				},{
					where: {
						pracUsername: updatedDocument.pracUsername,
						title: updatedDocument.oldTitle
					}
				})
				.then(function(updatedArray){
					return Promise.resolve({ 
						oldFile: foundDocument.file, // return the old file link for unlinking in document.route
						updated: updatedDocument,
						lastModified: curDate.toString(),
						message: 'updated successfully'
					});
				})
				.catch(err=> {
					return Promise.reject(err);
				})
			}
			else { //if newTitle is just the same as oldTitle, we don't need to update the file link
				updatedDocument.file=foundDocument.file;
				if (foundDocument.description === updatedDocument.description) { //if the descrpition also the same, we don't have to do anything
					return Promise.resolve({
						oldFile: foundDocument.file,
						updated: updatedDocument,
						message: "updated successfully"
					});
				}
				else {
					updatedDocument.lastModified=moment();
					return Document.update({
						title: updatedDocument.newTitle,
						description: updatedDocument.description,
						lastModified: updatedDocument.lastModified,
					},{
						where: {
							pracUsername: updatedDocument.pracUsername,
							title: updatedDocument.oldTitle
						}
					})
					.then(function(updatedArray){
						return Promise.resolve({
							oldFile: foundDocument.file,
							updated: updatedDocument,
							message: "updated successfully"
						});
					})
					.catch(err=> {
						return Promise.reject(err);
					})
				}
			}
		}
		else {
			return Promise.reject({
				statusCode:400,
				message:'Document with title '+ updatedDocument.oldTitle + ' cannot be found'
			})
		}
	})
	.catch(err=> {
		return Promise.reject(err);
	})
}