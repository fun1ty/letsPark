const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;
const SECRETKEY = env.SECRETKEY;

exports.verifyToken = (token) => {
  console.log("토큰검증 실행");
  console.log(token);

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
