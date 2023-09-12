const db = require("../models");
const vt = require("../utils/JwtVerifyToken");

const Price = db.Price;
const ParkingPay = db.ParkingPay;
const ShareParking = db.ShareParking;
const User = db.User;

const CparkingPay = {
  calculateParkingFee: async (req, res) => {
    try {
      // 요청 데이터 추출
      const { price, shareparkname, minutes } = req.body;

      // 헤더에서 토큰 추출 및 검증
      const token = req.headers.authorization.split(" ")[1];
      const userId = await vt.verifyToken(token);

      // 주차장 정보 조회
      const priceInfo = await Price.findOne({
        where: { shareparkname: shareparkname },
      });

      if (!priceInfo) {
        return res.status(404).json({
          status: "failure",
          error: "주차장 정보를 찾을 수 없습니다.",
        });
      }

      // 주차장 ID 조회
      const parkingId = await ShareParking.findOne({
        where: { shareparkname: shareparkname },
      });

      if (!parkingId) {
        return res.status(404).json({
          status: "failure",
          error: "주차장 정보를 찾을 수 없습니다.",
        });
      }

      // 사용자 정보 조회
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: "failure",
          error: "사용자 정보를 찾을 수 없습니다.",
        });
      }

      // 주차 요금 계산
      const baseAmount = price * minutes;
      const remainder = minutes % priceInfo.timerate;
      const additionalAmount =
        remainder > 0 ? price * (priceInfo.timerate - remainder) : 0;
      const totalFee = baseAmount + additionalAmount;

      // 주차 내역 저장
      await ParkingPay.create({
        payamount: totalFee,
        status: "success",
        userId: userId,
        publicParkingId: parkingId.id,
      });

      res.json({ status: "success", totalFee });
    } catch (error) {
      console.error("주차 요금 계산 및 저장 오류:", error);
      res.status(500).json({
        status: "failure",
        error: "서버에서 주차 요금 계산 및 저장 중 오류 발생",
        details: error.message,
      });
    }
  },
  parkingPay: async (req, res) => {
    res.render("parkingpay");
  },
};

module.exports = CparkingPay;
