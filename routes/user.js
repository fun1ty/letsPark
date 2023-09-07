const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');

router.get('/user/login', controller.login); //로그인
router.post('/user/login', controller.postLogin);

router.get('/user/signup', controller.signup); //회원가입
router.post('/user/signup', controller.postSignup);

router.get('/user/verify', controller.verify); //전화번호 인증

router.get('/user/:userid/:nickname/success', controller.success); //회원가입 성공

router.get('/mypage/:userid', controller.profile); // 회원정보 조회
router.patch('/mypage/:userid/edit', controller.editProfile); // 회원정보 수정
router.delete('/mypage/:userid/drop', controller.drop); // 회원 탈퇴

module.exports = router;
