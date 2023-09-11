const models = require("../models/index");
const jwt = require("jsonwebtoken");
const  vt  = require('../utils/JwtVerifyToken');
const rto = require('../utils/ResultToObject');
require('dotenv').config();
const env = process.env;

//공유주차장 상세페이지 이동
exports.detail = async (req, res) => {
    const id = req.query.id;
    try {
        const result = await models.ShareParking.findOne({
            where : { id },
        });

        res.render('shareParkingDetail', { result });
    } catch (error) {
        console.log(error);
    }
};

//공유주차장 등록 페이지 이동
exports.shareParking = async (req, res) => {

    res.render('enrollShareParking', { javascriptkey : env.JAVASCRIPTKEY });

}

exports.test = async (req, res) => {
    res.render('test');
}
//공유주차장 등록
exports.enrollShareParking = async (req, res) => {
    const token = req.headers.authorization;

    const id = await vt.verifyToken(token);

    const location = req.file.location;
    const {shareparkname, address, price, lat, lng} = req.body;

    try {
        const result = await models.ShareParking.create({
            shareparkname, address, price, lat, lng, location,
            userid : 1, status : 'Y',
        });

        console.log(result);
        res.send({ result : true });
    } catch (err) {
        console.log(err);
    }
};

//공유주차장 정보수정
exports.editShareParking = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    const userId = vt.verifyToken(token);
    //이미지 업데이트 유무 판단
    if(req.file.location === null) {
        res.send({ result : false });
    } else {
        res.send({ result : true });
    }
};

//공유주차장 정보삭제
exports.deleteShareParking = async (req, res) => {
 const token = req.headers.authorization.split(' ')[1];

 const userId = vt.verifyToken(token);

 let id;
 try {
    id = await models.User.findOne({
        attributes : ['id'],
        where : { userid : userId },
    });
 } catch (err) {
     console.log(err);
 }
 const shareParkingId = req.body.shareParkingId;

 try {
     const result = await models.ShareParking.update({ status : 'N' },
         {
             where : { id : shareParkingId, user_id : id }
     })
 } catch (err) {
     console.log(err);
 }
};

//공유주차장 예약 결제
exports.pay = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    const userId = vt.verifyToken(token);
};
