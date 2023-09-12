<<<<<<< HEAD
const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;
const SECRETKEY = env.SECRETKEY;

exports.verifyToken = (token) => {
  console.log("토큰검증 실행");
  console.log(token);
=======
const jwt = require('jsonwebtoken');
const env = process.env;
require('dotenv').config();
const SECRETKEY = env.SECRETKEY;

exports.verifyToken = (token) => {
  console.log('토큰검증 실행');
>>>>>>> 1ec4eeab4d8462f08b20f9421001581f35d01fee
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
