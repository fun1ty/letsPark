const models = require("../models/index");
const jwt = require('jsonwebtoken');
const vt = require('../utils/JwtVerifyToken');
const rto = require('../utils/ResultToObject');

//노상주차장 상세보기
exports.detail = async (req, res) => {
  const id = req.query.id;
  let publicParkingDetailResult;
  try {
    const result = await models.PublicParking.findOne({
      where: { id : id },
      include: [
        {
          model: models.OperationTime,
          attributes : ['weekday_begin', 'weekday_end', 'weekend_begin', 'weekend_end', 'holiday_begin', 'holiday_end'],
        },
        {
          model : models.Price,
          attributes: ['rates', 'timerate', 'addrates', 'addtimerate', 'daymax'],
        },
          ]
    });
    publicParkingDetailResult = rto.resultToObject((result));
  } catch (error) {
    console.log(error);
  };

  try {
    const result = await models.ParkingReview.findAll({
      include : [{
        model : models.User,
        attributes : ['profile'],
      }],
      attributes: ['nickname', 'score', 'comment'],
      where: {
        type: 1,
        parkid: id,
      },
    });
    let average = 0;
    let len = result.length;

    for (let obj of result) {
      average += obj.score;
    }
    if(average !== 0) {
      average = average / len;
      average = Math.round(average * 100) / 100;
    }
    console.log(publicParkingDetailResult.operationtime.weekend_begin);
    console.log(result);
    res.render('publicParkingDetail', { publicParkingDetailResult, result, average })
  } catch (err) {
    console.log(err);
  };
};
//노상주차장 리뷰리스트 가져오기
exports.reviews = async (req, res) => {
  const id = req.query.id;
  try {
    const result = await models.ParkingReview.findAll({
      attributes : ['nickname', 'score', 'comment'],
      where : { type : 1,
                    parkid : id, },
    });
    let average = 0;
    let len = result.length;

    for(let obj of result) {
      average += obj.score;
    }
    average = average / len;
    average = Math.round(average * 100) / 100;

    console.log(result);
    res.send({ result, average });
  } catch (error) {
    console.log(error);
  }
}

//노상주차장 리뷰 작성
exports.writeReview = async (req, res) => {

  const {publicParkingId, score, comment} = req.body;
  const token = req.headers.authorization;

  const id = await vt.verifyToken(token);

  let nickname;
  try {
    const result = await models.User.findOne({
      attributes : ['nickname'],
      where : { id },
    });
    nickname = result.nickname;
  } catch(error) {
    console.log(error);
  }

  try {
    const result = await models.ParkingReview.create({
      type : 1,
      parkid : publicParkingId,
      nickname,
      score,
      comment,
      user_id : id,
    });
    res.send({result : true});
  } catch (error) {
    console.log(error);
  }
};