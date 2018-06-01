var jwt = require('jsonwebtoken');
var fs = require('fs');

var cert = fs.readFileSync(__dirname + '/key/key.pem');
var pub = fs.readFileSync(__dirname + '/key/key.pub');

// Encrypt
exports.sign = function (obj, callback) {
    jwt.sign(obj, cert, {
        algorithm: 'RS256',
        expiresIn: 300
    }, function (err, token) {
        callback(err, token);
    });
}

// Decrypt
exports.verify = function (token, callback) {
    return jwt.verify(token, pub, function (err, decoded) {
        return callback(err, decoded);
    });
};
