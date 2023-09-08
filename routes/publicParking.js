const express = require("express");
const publicParkingController = require('../controller/CpublicParking');
const router = express.Router();


//상세보기
router.get('/detail', publicParkingController.detail);

//리뷰리스트 가져오기
router.get('/detail/reviews', publicParkingController.reviews);

//리뷰 작성
router.post('/detail/reviews', publicParkingController.writeReview);

module.exports = router;