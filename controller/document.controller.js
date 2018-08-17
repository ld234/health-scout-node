var Document = require('../model/document.model');
var Op = require('sequelize').Op;
var authController = require('./auth.controller');
var Practitioner = require('../model/practitioner.model');

module.exports= {
	addDocument,
	updateDocument,
	deleteDocument
}

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
				var pathComps = foundDocument.file.split('/'); //seperates into ['tmp','hqh719','file.pdf']
				var fileNames=pathComps[pathComps.length-1].split('.'); //seperate into ['file','pdf']
				//replace 'file' with the document new title, then attach .pdf
				updatedDocument.file = pathComps.slice(0,-1).join('/') + '/'+ updatedDocument.newTitle+ '.'+ fileNames[fileNames.length-1];
				return Document.update({
					title: updatedDocument.newTitle,
					description: updatedDocument.description,
					file: updatedDocument.file
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
						message: 'updated successfully'
					});
				})
				.catch(err=> {
					return Promise.reject({
						statusCode:400,
						message: 'Updated document already exists'
					});
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
					return Document.update({
						title: updatedDocument.newTitle,
						description: updatedDocument.description,
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