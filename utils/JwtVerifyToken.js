const jwt = require('jsonwebtoken');
const SECRETKEY = process.env.SECRETKEY;
const token = 'token';

exports.verifyToken = (token) => {
  let userId;
  jwt.verify(token, SECRETKEY, (err, decoded) => {
    if (err) return false;
    userId = decoded.id;
  });

  return userId;
};
