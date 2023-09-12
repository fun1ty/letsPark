const axios = require("axios");
const models = require("../models/index");
const { x64 } = require("crypto-js");
const { Navigator } = require("node-navigator");
const vt = require("../utils/JwtVerifyToken");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;

exports.chat = async (req, res) => {
  res.render("chat");
};

exports.main = async (req, res) => {
  let chatList;
  try {
    //조인으로 가져오기 ChatRoom, ChatUser
    (chatList = await models.ChatUser.findAll({
      roomid,
      userid,
      joinuser,
      include: [{ model: ChatRoom, attributes: ["roomname"] }],
      where: {
        roomid: roomFind.id,
      },
    })),
      res.render("index", { javascriptkey: env.JAVASCRIPTKEY });
  } catch (error) {
    console.log("Cmain에러", error);
  }
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

  let cleaningList;
  try {
    cleaningList = await models.Cleaning.findAll({
      include: [
        {
          model: models.ShareParking,
          as: "shareparking",
          attributes: ["lat", "lng"],
        },
      ],
      attributes: { exclude: ["price", "content"] },
    });
  } catch (err) {
    console.log(err);
  }

  let shareParkingList;
  try {
    shareParkingList = await models.ShareParking.findAll({
      attributes: ["id", "lat", "lng", "price"],
      where: { status: "Y" },
    });
  } catch (err) {
    console.log(err);
  }
  let allLen = publicParkingList.length + shareParkingList.length;

  console.log(cleaningList);
  res.json({ publicParkingList, shareParkingList, cleaningList, allLen });
};

exports.chat = (req, res) => {
  res.render("chat");
  socketModule(io);
};

function socketModule(io) {
  // 클라이언트 연결 이벤트 핸들링
  io.on("connection", (socket) => {
    console.log("라우터접속");
    // connection 함수 호출
    connection(io, socket);
  });

  res.json({ publicParkingList, shareParkingList, allLen });
}

exports.ppdb = async (req, res) => {
  let map = new Map();
  for (let i = 1; i < 18000; i += 1000) {
    console.log("----------------------------", i);
    await axios({
      method: "GET",
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
        tel: value.tel,
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
  console.log("hi");
  const result = await models.PublicParking.findAll();
  console.log("reulst", result);
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
