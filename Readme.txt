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
	
-Change password: https://localhost:8080/user/changePassword (PUT)
	- Body: oldPassword, newPassword, confirmPassword, header is x-access-token to get the username
	- Return: nothing if successful (204 No Content), else errors
		
FOR PATIENT
- Create patient:
	- Request: localhost:PORT/user/patient/ (POST)
	- return: patientUsername
	
- SEARCH FOR PRACTITIONERS
	- SEARCH BY RADIUS
		- Request: localhost:PORT/search/radius (POST)
			- Request body: latitude, longitude, radius (latitude and longitude is the patient's current location)
			- Return: this is an example
			[
				{
					"pracUsername": "hqh719",
					"pracType": "Dietitian",
					"serviceProvided": "consultation",
					"businessAddress": "93 Albert St Revesby NSW 2212",
					"description": "I'm awesome",
					"rating": null,
					"User": {
						"title": "Dr.",
						"fName": "Kevin",
						"lName": "Ha",
						"profilePic": "/profilePics/hqh719/hqh719-1538885110085.jpg"
					}
				},
				{
					"pracUsername": "tnmn817",
					"pracType": "Exercise physiologist",
					"serviceProvided": "exercise",
					"businessAddress": "14 Bligh Street Wollongong NSW 2500",
					"description": null,
					"rating": null,
					"User": {
						"title": "Dr.",
						"fName": "Mai",
						"lName": "Nguyen",
						"profilePic": "/profilePics/tnmn817/tnmn817-1538885471887.jpg"
					}
				}
			]
			
			
- ADD/DELETE/GET MEDICATION, ALLERGY, FAMILY HISTORY: localhots:PORT/patient/medicalDetails
    - Add (POST)
        - Allergy: /allergy (Request body: allergy=...is required, symptom=...)
        - Family History: /familyHistory (Request body: familyRelation=...is required, familyCondition=...)
        - Medication: /medication (Request body: fillDate=...is required, medication=...is required, for others please check the model)
        - Return value: the just added allergy/family history/medication record
    - Delete (DELETE)
        - Same route as Add.
        - Return value: message 'allergy/Family history/medication deleted successfully'
    - Get (GET)
        - Same route as Add
        - Return value: a list of allergy/family history/medication with all attributes taken from the corresponding models
        - Same route as Add
        
- GET Consultation for patient
    - Request: localhost:PORT/patient/medicalDetails/consultation
    - Return value: a list of consultation list relating to the patient, including:
        - All attributes from the Consultation model
        - pracType from Practitioner
        - title, fName, lName from User
		
		
- CONNECT with practitioner
	- Request: localhost:PORT/patient/connect/ (POST)
		- Request body: pracUsername(required), stripeToken(required), goal, conditions, message,...(see model)
		- Return: the newly created record in PatientDoctorRelation
		
- VIEW PRACTITIONER Profile
	- Base request: localhost:PORT/patient/pracProfile/
	- View prac profile: when patient clicks to view prac profile, update viewsToday of prac to viewsToday+1
		- Request: same as base (PUT)
		- Require: pracUsername
		- Return: pracUsername, viewsToday(updated)
	- Get General Info
		- request: same as base (GET)
		- require: pracUsername
		- return: pracUsername,pracType,serviceProvided,rating, description,viewsToday,User.title,fName,lName
	- Get Specialty/Qualification:
		- request: base+/specialty or /qualification
		- require: pracUsername
		- return: list of specialties/qualifications
	- Get Testimonial
		- request: base+/testimonial
		- require: pracUsername
		- return: only returns the testimonials that has a rating != null
			[
				{
					"title": "Mr.",
					"fName": "Quan",
					"lName": "Ha",
					"patientUsername": "hqh147",
					"testimonial": "good",
					"rating": "5"
				}
			]
	- Add Testimonial: only possible if there's a relation between patient and prac
		- Request: base+/testimonial
		- Require: pracUsername
		- Return: testimonial: {pracUsername,by,testimonial,rating} (by is the patientUsername)

		
NOTE NOTE NOTE: for all Date values sent from front end, make sure the format is YYYY-MM-DD, otherwise
the backend will not handle it correctly.