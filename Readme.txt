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
			
Send and view document API
- For practitioner:
	- Get a list of documents, including documents that are not sent yet and documents that are sent but not received back from patients:
		- Request: https://localhost:8080/clients/profile/exchangeDocument?patientUsername=... (GET)
		- Return: {title, description, patientUsername, status} (status is either 'Send' or 'Delivered')
	- Send a document to patient
		- https://localhost:8080/clients/profile/exchangeDocument (POST)
		- Request body; patientUsername, title
		- Return: {pracUsername, patientUsername, title}
	- Get new received documents from patient (documents that paractitioners have not seen yet):
		- Request: https://localhost:8080/clients/profile/exchangeDocument/newReceivedDocuments?patientUsername=... (GET)
		- Return: ReceivedDocument (see model/receive.document.model.js). status if false if document is not seen, true if seen
		- new received documents are received in desceding order of date
	- Get old received documents from patient: exactly the same, change new to old in the request 
	- See a document that patient sends back:
		- Request: https://localhost:8080/clients/profile/exchangeDocument/seeDocument (PUT)
		- Request body: patientUsername,title
		- Return: the pdf document that patient has filled in (to be viewed in browser and ready to be downnloaded to practitioner's PC)
		- Note: to test this feature, create a new folder under root named receivedDocuments. Then a sub-folder named after the pracUsername. 
		Then inside that are multiple sub-folders named after patientUsername, each corresponding with the documents sent back by a patient.
		
- For patient:
	- Get a list of requested documents from practitioners: https://localhost:8080/clients/profile/exchangeDocument/patient (GET)
		- Return: patientUsername, title, pracUsername, description, file (the link to download the file from public/documents), doctorName (Example: Mr Kevin Ha, Dietitian),
		
	- Upload a document to send back to practitioner: https://localhost:8080/clients/profile/exchangeDocument/upload (POST)
		- Body: pracUsername, title (same as the title of the practitioner's document), file (the file to be uploaded)
		
Resend Verification: https://localhost:8080/auth/resendVerification (POST)
	- body: username, email, fName
	- return: username, verification
	
Purchase bundle after registration: https://localhost:8080/charge/ (PUT)
	- body: bundle (standard, premium, platinum); stripeToken and pracUsername taken from x-access-token
	- return: nothing because status code is 204 No Content.
		