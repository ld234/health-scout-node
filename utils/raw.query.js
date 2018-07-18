const sequelize = require('../db/sql-connection');

module.exports = {
    getPractitionerDetails
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