const express = require("express");
const shareParkingController = require('../controller/CshareParking');
const upload = require("../utils/S3upload");
const router = express.Router();

//상세보기
router.get('/detail', shareParkingController.detail);

//공유주차장 등록 페이지 이동
router.get('/', shareParkingController.shareParking);

//공유주차장 등록
router.post('/', upload.single('file'), shareParkingController.enrollShareParking);

//공유주차장 등록 테스트용
router.get('/test', shareParkingController.test);

module.exports = router;
