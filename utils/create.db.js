const Sequelize = require('sequelize');
const connection = require('../db/sql-connection');
const RawQuery= require('./raw.query');

//declare the models
const UserModel= require('../model/user.model');
const VerificationModel= require('../model/verification.model');
const PractitionerModel= require('../model/practitioner.model');
const PatientModel= require('../model/patient.model');
const RegisteredBusinessModel= require('../model/registered.business.model');
const PracTypeSpecialtyModel= require('../model/practype.specialty.model');
const PatientDoctorRelationModel= require('../model/patient.doctor.relation.model');
const SpecialtyModel= require('../model/specialty.model');
const QualificationModel= require('../model/qualification.model');
const DocumentModel= require('../model/document.model');
const PatientRelationModel= require('../model/patient.relation.model');
const PatientAllergyModel= require('../model/patient.allergy.model');
const PatientDoctorDocumentModel = require('../model/patient.doctor.document.model');
const ReceivedDocumentModel = require('../model/received.document.model');
const MedicationModel= require('../model/medication.model');

//declare the exported objects
const User = UserModel(connection);
const Verification= VerificationModel(connection);
const Practitioner = PractitionerModel(connection);
const Patient = PatientModel(connection);
const RegisteredBusiness = RegisteredBusinessModel(connection);
const PracTypeSpecialty = PracTypeSpecialtyModel(connection);
const PatientDoctorRelation = PatientDoctorRelationModel(connection);
const Qualification = QualificationModel(connection);
const Specialty = SpecialtyModel(connection);
const Document = DocumentModel(connection);
const PatientRelation = PatientRelationModel(connection);
const PatientAllergy = PatientAllergyModel(connection);
const PatientDoctorDocument= PatientDoctorDocumentModel(connection,Document); //cannot add foreign key to Document the normal way, has to use raw query after syncing
const ReceivedDocument = ReceivedDocumentModel(connection,Document);
const Medication = MedicationModel(connection);

//declare associations
Verification.belongsTo(User,{foreignKey: 'username'});
Practitioner.belongsTo(User,{foreignKey: 'pracUsername'});
Patient.belongsTo(User,{foreignKey: 'patientUsername'});

Practitioner.belongsToMany(Patient,{through: PatientDoctorRelation, foreignKey: 'pracUsername'});
Patient.belongsToMany(Practitioner,{through: PatientDoctorRelation, foreignKey: 'patientUsername'});

const Consultation = connection.define('Consultation',{
	pracUsername: {
		type: Sequelize.STRING,
		primaryKey: true,
		validate: {
			isAlphanumeric: true
		},
		references: {
			model: PatientDoctorRelation,
			key: 'pracUsername'
		}
	},
	patientUsername: {
		type: Sequelize.STRING,
		primaryKey: true,
		validate: {
			isAlphanumeric: true
		},
		references: {
			model: PatientDoctorRelation,
			key: 'patientUsername'
		}
	},
	consultDate: {
		type: Sequelize.DATEONLY,
		primaryKey: true
	},
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	summary: {
		type: Sequelize.TEXT
	},
	intervention: {
		type: Sequelize.TEXT
	}
},{
	timestamps: false,
	freezeTableName: true
});

Practitioner.hasMany(Specialty,{foreignKey: 'pracUsername'});
Practitioner.hasMany(Qualification,{foreignKey: 'pracUsername'});
Practitioner.hasMany(Document,{foreignKey: 'pracUsername'});

Patient.hasMany(PatientRelation,{foreignKey: 'patientUsername'});
Patient.hasMany(PatientAllergy,{foreignKey: 'patientUsername'});
Patient.hasMany(PatientDoctorDocument,{foreignKey: 'patientUsername'});
Patient.hasMany(ReceivedDocument,{foreignKey: 'patientUsername'});
Patient.hasMany(Medication, {foreignKey: 'patientUsername'});

connection.sync().then(() => {
	RawQuery.init();
	
	//automate the update viewsToday back to 0 after every day
	connection.query('SET GLOBAL event_scheduler=ON;');
	connection.query('DROP EVENT IF EXISTS update_viewsToday;');
	connection.query('CREATE EVENT IF NOT EXISTS update_viewsToday '
					+'ON SCHEDULE EVERY 1 DAY '
					+'STARTS CURRENT_TIMESTAMP '
					+'DO '
					+'UPDATE Practitioner SET viewsToday=0;');

	
	connection.query('SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_NAME= "FK_Document";',{type:Sequelize.QueryTypes.SELECT})
	.then(rows=>{
		if (rows.length==0) {
			connection.query('ALTER TABLE PatientDoctorDocument ADD CONSTRAINT FK_Document FOREIGN KEY (pracUsername,title) REFERENCES Document(pracUsername,title) '
					+ 'ON UPDATE CASCADE ON DELETE CASCADE;');
		}
	})
	.catch(err=>{
		console.log(err);
	})
	
	connection.query('SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_NAME= "FK_Received_Document";',{type:Sequelize.QueryTypes.SELECT})
	.then(rows=>{
		if (rows.length==0) {
			connection.query('ALTER TABLE ReceivedDocument ADD CONSTRAINT FK_Received_Document FOREIGN KEY (pracUsername,title) REFERENCES Document(pracUsername,title) '
				+ 'ON UPDATE CASCADE ON DELETE CASCADE;');
		}
	})
	.catch(err=>{
		console.log(err);
	})
	
	connection.query('DROP TRIGGER IF EXISTS calc_rating; CREATE TRIGGER calc_rating AFTER UPDATE ON PATIENTDOCTORRELATION '
						+ 'FOR EACH ROW BEGIN '
							+ 'UPDATE PRACTITIONER SET rating = (SELECT AVG(rating) FROM PATIENTDOCTORRELATION WHERE pracUsername = NEW.pracUsername AND rating IS NOT NULL) '
							+ 'WHERE pracUsername=NEW.pracUsername;'
						+ 'END;')
	.then((res)=> {
		// console.log('res',res);
	})
	.catch((err)=>{
		// console.log('create.db err',err);
	})
	connection.query('DROP TRIGGER IF EXISTS update_conn; CREATE TRIGGER update_conn BEFORE UPDATE ON PATIENTDOCTORRELATION '
					+'FOR EACH ROW BEGIN '
						+ 'DECLARE availConn DECIMAL(10,0);'
						+ 'SELECT availableConnections INTO availConn '
						+ 'FROM PRACTITIONER '
						+ 'WHERE PRACTITIONER.pracUsername=NEW.pracUsername; '
						+ 'IF NEW.seen <> OLD.seen AND NEW.seen = true THEN '
							+'IF availConn<=0 THEN '
								+ 'SIGNAL SQLSTATE \'45000\' '
								+ 'SET MESSAGE_TEXT= "RUN OUT OF AVAILABLE CONNECTIONS. BUY MORE USING BUNDLES"; '
							+'ELSE '
								+'UPDATE PRACTITIONER SET availableConnections = availableConnections - 1 WHERE pracUsername = NEW.pracUsername;'
							+'END IF;'
						+ 'END IF;'
					+ 'END;')
	.then((res)=> {
		// console.log('res',res);
	})
	.catch((err)=>{
		// console.log('err2',err);
	})
	console.log('Successfully connected to database');
});

const db = {User, Patient, Practitioner, Verification, PracTypeSpecialty, RegisteredBusiness, PatientDoctorRelation, Consultation, Specialty, Qualification, Document,
				PatientRelation, PatientAllergy, Medication, PatientDoctorDocument, ReceivedDocument};
			
module.exports=db;