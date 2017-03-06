
var jwt = require('jsonwebtoken');

cert = "myCert";

// jwt.sign({ foo: 'bar' }, 'cert', { algorithm: 'RS256' }, function(err, token) {
//     console.log(token);
// });

var token = jwt.sign({ foo: 'bar' }, 'cert');
console.log(token);