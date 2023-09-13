const db = require("../models");
const vt = require("../utils/JwtVerifyToken");

const Price = db.Price;
const ParkingPay = db.ParkingPay;
const ShareParking = db.ShareParking;
const User = db.User;

const calculateParkingFee = async (req, res) => {
  try {
    // 요청 데이터 추출
    const { price, shareparkname } = req.body;

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

    // 주차장 정보에서 shareparking_id를 가져옴
    const parkingInfo = await ShareParking.findOne({
      where: { shareparkname: shareparkname },
    });

    if (!parkingInfo) {
      return res.status(404).json({
        status: "failure",
        error: "주차장 정보를 찾을 수 없습니다.",
      });
    }

    const shareparkingId = parkingInfo.id;

    // // 주차장 ID 조회
    // const parkingId = await ShareParking.findOne({
    //   where: { shareparkname: shareparkname },
    // });

    // if (!parkingId) {
    //   return res.status(404).json({
    //     status: "failure",
    //     error: "주차장 정보를 찾을 수 없습니다.",
    //   });
    // }

    // 사용자 정보 조회
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: "failure",
        error: "사용자 정보를 찾을 수 없습니다.",
      });
    }

    // 주차 내역 저장
    const createdPay = await ParkingPay.create({
      payamount: totalFee, // 위에서 계산된 주차 요금을 사용
      status: "success",
      userId,
      shareparkingId,
    });

    res.json({ status: "success", index: createdPay.id });
  } catch (error) {
    console.error("주차 요금 계산 및 저장 오류:", error);
    res.status(500).json({
      status: "failure",
      error: "서버에서 주차 요금 계산 및 저장 중 오류 발생",
      details: error.message,
    });
  }
};

const parkingPay = async (req, res) => {
  res.render("parkingpay");
};
const paySuccess = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await ParkingPay.findOne({
      where: { id },
      include: [
        {
          model: ShareParking,
          attributes: ["shareparkname", "price"],
        },
      ],
    });

    if (!result) {
      return res.status(404).json({
        status: "failure",
        error: "결제 정보를 찾을 수 없습니다.",
      });
    }

    res.render("payok", { result });
  } catch (error) {
    console.error("결제 정보 조회 오류:", error);
    res.status(500).json({
      status: "failure",
      error: "서버에서 결제 정보 조회 중 오류 발생",
      details: error.message,
    });
  }
};

const save = async (req, res) => {
  console.log(req.body);
  // 헤더에서 토큰 추출 및 검증
  const token = req.headers.authorization.split(" ")[1];
  const userId = await vt.verifyToken(token);
  const result = await ParkingPay.create({
    payamount: req.body.amount,
    pg: req.body.pg,
    user_id: userId,
    shareparking_id: req.body.shareparking_id,
  });
  console.log(result);
  if (result) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
};

module.exports = {
  calculateParkingFee,
  parkingPay,
  paySuccess,
  save,
};
