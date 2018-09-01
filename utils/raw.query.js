const sequelize = require('../db/sql-connection');
const fs = require('fs');

module.exports = {
	init,
    getPractitionerDetails
}

function init(){
	const fileContent = fs.readFileSync(__dirname+'/../db/sqlScripts/init.sql','utf8').split(';');
	fileContent.forEach( (line, idx) => {
		sequelize.query(line, { type: sequelize.QueryTypes.INSERT})
		.then((res,meta) => {
			// console.log(res);
		})
		.catch( (err) => {console.log('err',err)} );
	})
	
}

function getPractitionerDetails(username) {
    return sequelize.query('SELECT * FROM user U JOIN practitioner P ON U.username = P.pracUsername WHERE username = $username', 
        { bind: { username: username }, type: sequelize.QueryTypes.SELECT })
        .then(function(user) {
            return Promise.resolve(user[0]);
        })
        .catch( err => {
            return Promise.reject(err);
        })
}