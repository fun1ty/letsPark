const SocketIO = require("socket.io"); //웹소켓
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = SocketIO(server);
const axios = require("axios");
const models = require("../models/index");

exports.main = (req, res) => {
  res.render("index");
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
}

const roomList = [];

exports.connection = (io, socket) => {
  console.log("socket 접속");
  console.log("io", io);
  //채팅방 목록 보내기
  socket.emit("roomList", roomList);

  //채팅방 만들기 생성
  socket.on("create", (roomName, userName, cb) => {
    //join(방이름) 해당 방이름으로 없다면 생성. 존재하면 입장
    //socket.rooms에 socket.id값과 방이름 확인가능
    socket.join(roomName);
    //socket은 객체이며 원하는 값을 할당할 수 있음
    socket.room = roomName;
    socket.user = userName;

    socket.to(roomName).emit("notice", `${socket.id}님이 입장하셨습니다`);

    //채팅방 목록 갱신
    if (!roomList.includes(roomName)) {
      roomList.push(roomName);
      //갱신된 목록은 전체가 봐야함
      io.emit("roomList", roomList);
    }
    const usersInRoom = getUsersInRoom(roomName);
    io.to(roomName).emit("userList", usersInRoom);
    cb();
  });

  socket.on("sendMessage", (message) => {
    console.log(message);
    if (message.user === "all") {
      io.to(socket.room).emit(
        "newMessage",
        message.message,
        message.nick,
        false
      );
    } else {
      io.to(message.user).emit(
        "newMessage",
        message.message,
        message.nick,
        true
      );
      //자기자신에게 메세지 띄우기
      socket.emit("newMessage", message.message, message.nick, true);
    }
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      socket.leave(socket.room);
    }
  });

  function getUsersInRoom(room) {
    const users = [];
    //채팅룸에 접속한 socket.id값을 찾아야함
    const clients = io.sockets.adapter.rooms.get(room);
    //console.log(clients);
    if (clients) {
      clients.forEach((socketId) => {
        //io.sockets.sockets: socket.id가 할당한 변수들의 객체값
        const userSocket = io.sockets.sockets.get(socketId);
        //개별 사용자에게 메세지를 보내기 위해서 객체형태로 변경
        //key: 소켓아이디, name:이름
        const info = { name: userSocket.user, key: socketId };
        users.push(info);
      });
    }
    return users;
  }
};

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
