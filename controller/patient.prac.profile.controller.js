const db = require('../utils/create.db');
const Practitioner = db.Practitioner;
const PatientDoctorRelation = db.PatientDoctorRelation;
const Specialty = db.Specialty;
const Qualification = db.Qualification;

module.exports= {
	getSpecialty,
	getQualification,
	getGeneralInfo,
	getTestimonial,
	addTestimonial,
}

