const Sequelize = require('sequelize');
const connection = require('../db/sql-connection')
var User = connection.define('user',{
    username: { 
        type: Sequelize.STRING(30),
        primaryKey: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    salt:{
        type: Sequelize.STRING(10),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
    },
    active:{
        type : Sequelize.BOOLEAN,
        defaultValue : false,
        allowNull : false
    }
},{
	timestamps: false,
	freezeTableName: true
});

connection.sync().then(() => {
    console.log('Successfully connected to database');
});
module.exports = User;