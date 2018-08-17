View old client list: http://localhost:8888/clients/view
View new client list: http://localhost:8888/clietns/viewNew
View Client Profile: http://localhost:8888/clients/viewProfile?patientUsername=...

Add new Document: http://localhost:8888/document/add
	title:
	description: (optional)
	file: 

Delete document: http://localhost:8888/document/delete?title=...

Update document: http://localhost:8888/document/update
	oldTitle:
	newTitle:
	description: (optional)
	file: (optional). If specify, we replace the existing file with new uploaded file, and possibly rename it according to new title