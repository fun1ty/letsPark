const models = require("../models/index");
const jwt = require("jsonwebtoken");
const vt = require("../utils/JwtVerifyToken");
const rto = require("../utils/ResultToObject");
const { Sequelize } = require("sequelize");
require("dotenv").config();
const env = process.env;

//공유주차장 상세페이지 이동
exports.detail = async (req, res) => {
  const id = req.query.id;
  try {
    const result1 = await models.ShareParking.findOne({
      where: { id },
    });

    const result2 = await models.User.findOne({
      where: { id: result1.user_id },
      attributes: ["nickname", "id"],
    });

    const result = await models.ParkingReview.findAll({
      attributes: ["nickname", "score", "comment"],
      where: {
        type: 2,
        parkid: id,
      },
    });
    let average = 0;
    let len = result.length;

    for (let obj of result) {
      average += obj.score;
    }
    if (average !== 0) {
      average = average / len;
      average = Math.round(average * 100) / 100;
    }
    res.render("shareParkingDetail", {
      result1,
      nickname: result2.nickname,
      id: result2.id,
      result,
      average,
    });
  } catch (error) {
    console.log(error);
  }
};

//공유주차장 등록 페이지 이동
exports.shareParking = async (req, res) => {
  res.render("enrollShareParking", { javascriptkey: env.JAVASCRIPTKEY });
};

exports.test = async (req, res) => {
  res.render("test");
};
//공유주차장 등록
exports.enrollShareParking = async (req, res) => {
  const token = req.headers.authorization;

  const id = await vt.verifyToken(token);
  try {
    const result = await models.User.findOne({
      where: { id },
    });
    if (result === null) {
      res.send({ result: false });
    }
  } catch (err) {
    console.log(err);
  }

  const location = req.file.location;
  const { shareparkname, address, price, lat, lng } = req.body;

  try {
    const result = await models.ShareParking.create({
      shareparkname,
      address,
      price,
      lat,
      lng,
      location,
      user_id: id,
      status: "Y",
    });

    console.log(result);
    res.send({ result: true });
  } catch (err) {
    console.log(err);
  }
};

//공유주차장 정보수정
exports.editShareParking = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const id = vt.verifyToken(token);

  const location = req.file.location;
  const { shareParkingId, shareparkname, price } = req.body;
  //이미지 업데이트 유무 판단
  if (req.file.location === null) {
    try {
      const result = models.ShareParking.update(
        { shareparkname, price },
        {
          where: { id: shareParkingId, user_id: id },
        }
      );

      res.send({ result: true });
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      const result = models.ShareParking.update(
        { shareparkname, name, location },
        {
          where: { id: shareParkingId, user_id: id },
        }
      );
      res.send({ result: true });
    } catch (err) {
      console.log(err);
    }
  }
};

//공유주차장 정보삭제
exports.deleteShareParking = async (req, res) => {
  const token = req.headers.authorization;

  const id = vt.verifyToken(token);

  const shareParkingId = req.body.shareParkingId;

  try {
    const result = await models.ShareParking.update(
      { status: "N" },
      {
        where: { id: shareParkingId, user_id: id },
      }
    );

    res.send({ result: true });
  } catch (err) {
    console.log(err);
  }
};

//공유주차장 예약 결제
exports.pay = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const userId = vt.verifyToken(token);
};

exports.reviews = async (req, res) => {
  const { shareParkId, score, comment } = req.body;
  const token = req.headers.authorization;

  const id = await vt.verifyToken(token);

  let nickname;
  try {
    const result = await models.User.findOne({
      attributes: ["nickname"],
      where: { id },
    });
    nickname = result.nickname;
  } catch (error) {
    console.log(error);
  }

  try {
    const result = await models.ParkingReview.create({
      type: 2,
      parkid: shareParkId,
      nickname,
      score,
      comment,
      user_id: id,
    });
    res.send({ result: true });
  } catch (error) {
    console.log(error);
  }
};

exports.getMySharePark = async (req, res) => {
  const token = req.headers.authorization;
  console.log("token", token);
  try {
    const id = await vt.verifyToken(token);

    res.send({ id, result: true });
  } catch (err) {
    console.log(err);
  }
};

exports.getMyShareParks = async (req, res) => {
  const id = req.query.id;
  try {
    const result = await models.ShareParking.findAll({
      where: { user_id: id },
    });
    console.log("result", result);
    res.render("myShareParks", { result });
  } catch (err) {
    console.log(err);
  }
};
