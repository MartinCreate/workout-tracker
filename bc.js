const bcrypt = require("bcryptjs");
const { promisify } = require("util");
let { genSalt, hash, compare } = bcrypt;

genSalt = promisify(genSalt); //generates our salt -> a random string
hash = promisify(hash);
compare = promisify(compare); //compare takes two arguments, plain text and a hash compare value (boolean: match/no-match)

module.exports.compare = compare;
module.exports.hash = (plainTxtPw) =>
    genSalt().then((salt) => hash(plainTxtPw, salt));
