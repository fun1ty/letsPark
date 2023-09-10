const jwt = require('jsonwebtoken');
const env = process.env;
require('dotenv').config();
const SECRETKEY = env.SECRETKEY;

exports.verifyToken = (token) => {
  console.log('토큰검증 실행');
  let userId;
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRETKEY, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded.id);
      }
    });
  });
};
