
const axios = require('axios');
const models = require('../models/index');
const jwt = require('jsonwebtoken');
const { x64 } = require('crypto-js');
const { Navigator } = require('node-navigator');
const vt = require('../utils/JwtVerifyToken');
require('dotenv').config();
const env = process.env;

exports.chat = async (req, res) => {
  res.render("chat");

};

// exports.main = (req, res) => {
//   console.log("main");
//   const token = req.headers.authorization;
//   if (token) {
//     try {
//       const decodedToken = jwt.verify(token, "SECRET");
//       const userId = decodedToken.userid;
//
//       const userInfo = {
//         userid: userId,
//       };
//
//       res.json(userInfo);
//       console.log(userInfo);
//     } catch (error) {
//       console.log("토큰 디코드 오류", error);
//     }
//   } else {
//res.redirect('/user/login');
//   }
//   res.render("index");
// };

exports.main = async (req, res) => {
  const user = req.user;
  const userInfo = { userid: user.userid, nickname: user.nickname };
  console.log('user: ', user);
  if (!user) {
    console.log('토큰 디코드 오류');
  } else {
    const authHeader = req.headers.authorization;
    console.log('controller authHeader: ', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('인증 헤더 없음');
    }
  }

  // const navigator = new Navigator();
  // let tempLocation;
  // navigator.geolocation.getCurrentPosition((success, error) => {
  //   if (error) console.error(error);
  //   else console.log(success);
  //   tempLocation = {
  //     lat: success.latitude,
  //     lng: success.longitude,
  //   };
  // });
  // let publicParkingList;
  // try {
  //   publicParkingList = await models.PublicParking.findAll({
  //     attributes: ['capacity', 'currentparking', 'lat', 'lng']})

  res.render('index', { javascriptkey: env.JAVASCRIPTKEY });

};

exports.getInfo = async (req, res) => {
  let publicParkingList;
  try {
    publicParkingList = await models.PublicParking.findAll({
      attributes: ["id", "capacity", "currentparking", "lat", "lng"],
    });
  } catch (err) {
    console.log(err);
  }

  //left outer join됨, attribute 적용안됬음
  // let cleaningList;
  // try {
  //   cleaningList = await models.Cleaning.findAll({
  //     include: [
  //       {
  //         model: models.ShareParking,
  //         attributes: ["id", "lat", "lng"],
  //       },
  //     ],
  //   });
  // } catch (err) {
  //   console.log(err);
  // }

  // let shareParkingIdList = [];
  // for (let idx of cleaningList) {
  //   shareParkingIdList.push(idx.shareparking_id);
  // }
  let shareParkingList;
  try {
    shareParkingList = await models.ShareParking.findAll({

      attributes: ['id', 'lat', 'lng', 'price'],
      where: { status: 'Y' },

    });
  } catch (err) {
    console.log(err);
  }
  let allLen = publicParkingList.length + shareParkingList.length;

  res.json({ publicParkingList, shareParkingList, allLen });
};

exports.ppdb = async (req, res) => {
  let map = new Map();
  for (let i = 1; i < 18000; i += 1000) {
    console.log('----------------------------', i);
    await axios({
      method: 'GET',
      url: `http://openapi.seoul.go.kr:8088/466354715470617039364d6b517341/json/GetParkingInfo/${i}/${
        i + 999
      }/`,
    }).then((response) => {
      const data = response.data.GetParkingInfo.row;
      data.forEach((idx) => {
        const code = Number(idx.PARKING_CODE);
        if (code === 0) return;

        const obj = {
          name: idx.PARKING_NAME,
          address: idx.ADDR,
          type: idx.PARKING_TYPE_NM,
          tel: idx.TEL,
          questatus: Number(idx.QUE_STATUS),
          capacity: idx.CAPACITY,
          currentparking: idx.CUR_PARKING,
          payyn: idx.PAY_YN,
          lat: idx.LAT,
          lng: idx.LNG,
          curparkingtime: idx.CUR_PARKING_TIME,
          weekday_begin: idx.WEEKDAY_BEGIN_TIME,
          weekday_end: idx.WEEKDAY_END_TIME,
          weekend_begin: idx.WEEKEND_BEGIN_TIME,
          weekend_end: idx.WEEKEND_END_TIME,
          holiday_begin: idx.HOLIDAY_BEGIN_TIME,
          holiday_end: idx.HOLIDAY_END_TIME,
          rates: idx.RATES,
          timerate: idx.TIME_RATE,
          addrates: idx.ADD_RATES,
          addtimerate: idx.ADD_TIME_RATE,
          monthfulltime: Number(idx.FULLTIME_MONTHLY),
          daymax: idx.DAY_MAXIMUM,
        };

        if (map.has(code)) {
          const beforeCapacity = map.get(code).capacity;
          obj.capacity = beforeCapacity + 1;
          map.set(code, obj);
        } else {
          map.set(code, obj);
        }
      });
    });
  }
  console.log(map.size);
  for (let [key, value] of map) {
    models.PublicParking.create(
      {
        code: key,
        name: value.name,
        address: value.address,
        type: value.type,
        tel: value.type,
        questatus: value.questatus,
        capacity: value.capacity,
        currentparking: value.currentparking,
        payyn: value.payyn,
        lat: value.lat,
        lng: value.lng,
        curparkingtime: value.curparkingtime,
        operationtime: {
          weekday_begin: value.weekday_begin,
          weekday_end: value.weekday_end,
          weekend_begin: value.weekend_begin,
          weekend_end: value.weekend_end,
          holiday_begin: value.holiday_begin,
          holiday_end: value.holiday_end,
        },
        price: {
          rates: value.rates,
          timerate: value.timerate,
          addrates: value.addrates,
          addtimerate: value.addtimerate,
          monthfulltime: value.monthfulltime,
          daymax: value.daymax,
        },
      },
      {
        include: [models.OperationTime, models.Price],
      }
    );
  }
};

//지도 핀 데이터
exports.parking = async (req, res) => {
  console.log('hi');
  const result = await models.PublicParking.findAll();
  console.log('reulst', result);
  const arr = [];
  for (let i = 0; i < result.length; i++) {
    const a = {
      content: result[i].name,
      lat: result[i].lat,
      lng: result[i].lng,
    };
    arr.push(a);
  }
  res.json({ data: arr });
};
