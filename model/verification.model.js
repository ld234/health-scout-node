const Sequelize = require('sequelize');
const connection = require('../db/sql-connection');
const User = require('./user.model');
var Verification = connection.define('verification',{
    username: { 
        type: Sequelize.STRING(20),
        primaryKey: true,
        references: {
            // This is a reference to another model
            model: User,
            // This is the column name of the referenced model
            key: 'username'
        },
        allowNull: false
    },
    verification:{
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
    },
}, {
	timestamps: false,
	freezeTableName: true
});

//connection.sync().then(function(){});

module.exports = Verification;