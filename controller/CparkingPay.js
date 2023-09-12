const db = require("../models");
const Price = db.Price;
const ParkingPay = db.ParkingPay;

const CparkingPay = {
  calculateParkingFee: async (req, res) => {
    try {
      console.log("요청:", req);
      console.log("요청 바디:", req.body);

      // 주차 시작 시간과 종료 시간을 요청에서 받아옴
      const { startTime, endTime } = req.body;

      // 가격 정보 가져오기 (Price 모델을 사용)
      const priceInfo = await Price.findOne();

      // 주차 시간(분) 계산
      const parkingMinutes =
        (new Date(endTime) - new Date(startTime)) / (1000 * 60);

      // 주차 요금 계산 (30분 단위)
      let totalFee =
        priceInfo.rates * Math.ceil(parkingMinutes / priceInfo.timerate);

      // 월 정기권 및 일 최대 요금 확인
      if (totalFee > priceInfo.daymax) {
        totalFee = priceInfo.daymax;
      } else if (totalFee > priceInfo.monthfulltime) {
        totalFee = priceInfo.monthfulltime;
      }

      // 주차 내역 저장
      await ParkingPay.create({
        rates: totalFee,
        timerate: parkingMinutes,
      });

      res.json({ success: true, totalFee });
    } catch (error) {
      console.error("주차 요금 계산 및 저장 오류:", error);
      res
        .status(500)
        .json({ success: false, error: "주차 요금 계산 및 저장 중 오류 발생" });
    }
  },
};

module.exports = CparkingPay;
