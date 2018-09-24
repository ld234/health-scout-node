var jwt = require('jsonwebtoken');
var fs = require('fs');

var cert = fs.readFileSync(__dirname + '/key/key.pem');
var pub = fs.readFileSync(__dirname + '/key/key.pub');

/*this follow the principle of digital signature. jwt.sign() uses the secret key (cert) to sign the object (S=M^d mod N). S is the token and is sent to the client
When clients make request to the API, they have to attach S together with the request
On server side, jwt.verify() will verify the token (M=S^e mod N), e is pub (the public key). If the result is actually the object M, verification is successful
*/

// Encrypt
exports.sign = function(obj, callback, duration){
    jwt.sign(obj, cert, {
        algorithm: 'RS256', //this is RSA signature on SHA256 (meaning: hash the obj using SHA256, then sign using RSA signature scheme)
        expiresIn: duration || '1d' 
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
