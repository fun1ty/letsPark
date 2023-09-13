const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');
const upload = require('../utils/S3upload');

router.get('/login', controller.login); //로그인
router.post('/login', controller.postLogin);

router.get('/signup', controller.signup); //회원가입
router.get('/checkDuplicate/:userid', controller.idCheck);
router.post('/signup', upload.single('profile'), controller.postSignup);

router.get('/:userid/:nickname/success', controller.success); //회원가입 성공

module.exports = router;
