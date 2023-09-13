const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');
const upload = require('../utils/S3upload');

router.get('/:userid', controller.profile); // 회원정보 조회

router.get('/:userid/edit', controller.edit);
router.patch('/:userid/edit', upload.single('profile'), controller.editProfile); // 회원정보 수정

router.delete('/:userid/drop', controller.drop); // 회원 탈퇴

module.exports = router;
