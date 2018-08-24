CREATE DATABASE healthscout;

DELIMITER $$
CREATE TRIGGER calc_rating AFTER INSERT ON PATIENTDOCTORRELATION
FOR EACH ROW BEGIN
    UPDATE PRACTITIONER SET rating = (SELECT AVG(rating) FROM PATIENTDOCTORRELATION WHERE pracUsername = NEW.pracUsername);
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER update_conn AFTER UPDATE ON PATIENTDOCTORRELATION
FOR EACH ROW BEGIN
    IF NEW.seen <> OLD.seen AND NEW.seen = true THEN
        UPDATE PRACTITIONER SET availableConnections = availableConnections - 1 WHERE pracUsername = NEW.pracUsername;
    END IF;
END$$
DELIMITER ;

INSERT INTO PRACTYPESPECIALTY VALUES ('Aboriginal/Indigenous Health','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Diabetes Type II','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Liver disease','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Pregnancy and fertility','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Aged Care','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Gestational Diabetes ','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Malnutrition/underweight','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Private hospital consulting','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Allergy and food sensitivity','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Disability','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Men\'s health','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Sports nutrition','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Arthritis','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Eating disorders ','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Mental health','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Swallowing difficulties','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Bariatric surgery','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Food industry consultant','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Mindful eating','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Teaching/lecturing','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Breastfeeding (lactation)','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Food services consultant','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Menu reviews','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Tube feeding','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Cancer (oncology)','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Gastrointestinal disorders','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Metabolic disorders','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Vegan nutrition','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Coeliac disease (Gluten free)','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('HIV','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Nursing home consultant','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Vegetarian nutrition','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Communication/Marketing','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Healthy Eating Advice','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Osteoporosis','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Weight loss','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Community education','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Heart disease','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Paediatrics','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Women\'s Health','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Cooking classes/demos','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Infant feeding','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Polycystic ovarian syndrome','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Diabetes type I','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Kidney disease','Dietitian');
INSERT INTO PRACTYPESPECIALTY VALUES ('Pre-diabetes','Dietitian');