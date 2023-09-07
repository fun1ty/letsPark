const models = require("../models/index");
const jwt = require('jsonwebtoken');

//노상주차장 상세보기
exports.detail = async (req, res) => {
  const id = req.query.id;
  try {
    const result = await models.PublicParking.findOne({
      include : [
        { model : models.OperationTime },
        { model : models.Price },
      ],
      where : { id },
    });

    res.send({result});
  } catch (error) {
    console.log(error);
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

    res.send({ result, average });
  } catch (error) {
    console.log(error);
  }
}

//노상주차장 리뷰 작성
exports.writeReview = async (req, res) => {
  //추후 객체구조분해할당으로 변경해야함
  const [publicParkingId, score, comment] = req.body;
  const token = req.headers.authorization.split(' ')[1];
  let userId;
  //jwt 토큰값 검증, 검증완료 시 userId 저장
  jwt.verify(token, SECRETKEY, (err, decoded) => {
    if(err)
      return res.status(404).send();

    userId = decoded.id;
  });

  //닉네임, id 가져오기
  let nickname, id;
  try {
    const result = await models.User.findOne({
      attributes : ['nickname', 'id'],
      where : { userid : userId },
    });
    nickname = result.nickname;
    id = result.id;
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
    res.send({result});
  } catch (error) {
    console.log(error);
  }
};