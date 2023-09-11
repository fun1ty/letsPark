const express = require("express");
const router = express.Router();
const parkingPayController = require("../controller/CparkingPay");

// 주차 요금 계산 및 저장 요청을 처리하는 라우트
router.post("/calculate", parkingPayController.calculateParkingFee);

module.exports = router;
