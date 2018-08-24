View old client list: http://localhost:8888/clients/
View new client list: http://localhost:8888/clietns/new
View Client Profile: http://localhost:8888/clients/profile?patientUsername=...

Add new Document: http://localhost:8888/document (POST) (multipart/form-data)
	Receive:
		- title:
		- description: (optional)
		- file: the link of the file in the user's local file system to be uploaded
	Return
		- Add a new document at: public/documents/<pracUsername>/<documentTitle>.pdf
		- Return {title, description, file} with file=documents/<pracUsername>/<documentTitle>.pdf

Delete document: http://localhost:8888/document?title=<title_of_deleted_document> (DELETE)
	- Return statusCode 200 and message:"Deleted successfully"

Update document: http://localhost:8888/document/ (UPDATE)
	- Receive: 
		- oldTitle:
		- newTitle:
		- description: (optional)
		- file: (optional). If specify, we replace the existing file with new uploaded file, and possibly rename it according to new title (if newTitle != oldTitle)
	- Return: 
		{oltTitle,newTitle, description, file} with description and file being the new description and new link to the file (file=documents/<pracUsername>/<newTitle>.pdf)
	

	
In Client profile:
	- Add new consultation: http://localhost:8888/clients/profile/consultation (POST method).
		- If medicines field is specified in request body, the medicines are added to Medicine table as well.
		- Example:
			{
				"patientUsername":"hqh147",
				"consultDate":"2018-08-20",
				"title":"Lol consultation",
				"summary":"",
				"intervention":"get fatter",
				"medicines":[
					{
						"medication":"becberin",
						"strength":0,
						"condition":"",
						"refill":2
					},
					{
						"medication":"med1",
						"condition":"",
						"refill":1
					},
					{
						"medication":"med2",
						"strength":1,
						"condition":"",
						"refill":1
					}
				]
			}