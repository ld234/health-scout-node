const Sequelize = require('sequelize');
const connection = new Sequelize('healthscout', 'root', 'root',{
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false
});

module.exports = connection;