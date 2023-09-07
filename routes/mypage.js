const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');

router.get('/:userid', controller.profile); // 회원정보 조회
router.patch('/:userid/edit', controller.editProfile); // 회원정보 수정
router.delete('/:userid/drop', controller.drop); // 회원 탈퇴

module.exports = router;
