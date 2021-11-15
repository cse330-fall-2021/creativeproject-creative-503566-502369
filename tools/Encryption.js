const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainText = "Hello World";
const crypto = require("crypto");

/*
    https://dev.to/aditya278/understanding-and-implementing-password-hashing-in-nodejs-2m84
 */

function hashAsync(str) {
    return bcrypt.genSalt(saltRounds)
        .then(salt => {
            bcrypt.hash(str, salt)
                .then(hash => {
                    return hash;
                });
        });
}

let exported = {
    hash: function hash(str) {
        return bcrypt.hashSync(str, 10);
    },
    compare: function compare(str, hashedStr) {
        return bcrypt.compareSync(str, hashedStr);
    },
    randomBase64: function () {
        return crypto.randomBytes(64).toString('base64');
    }
}

module.exports = exported;