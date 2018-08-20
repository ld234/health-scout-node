View old client list: http://localhost:8888/clients/
View new client list: http://localhost:8888/clietns/new
View Client Profile: http://localhost:8888/clients/profile?patientUsername=...

Add new Document: http://localhost:8888/document (POST)
	title:
	description: (optional)
	file: 

Delete document: http://localhost:8888/document?title=... (DELETE)

Update document: http://localhost:8888/document/ (UPDATE)
	oldTitle:
	newTitle:
	description: (optional)
	file: (optional). If specify, we replace the existing file with new uploaded file, and possibly rename it according to new title
	
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