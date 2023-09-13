const models = require("../models/index");
const jwt = require("jsonwebtoken");
const vt = require("../utils/JwtVerifyToken");
const S3 = require("../utils/S3upload");
const randomBytes = require("crypto").randomBytes(2);
const number = parseInt(randomBytes.toString("hex"), 16);
// const roomList = [];
const user = [];
let roomName;
let roomFind;
let msg;
let roomDBInsert;
let profile;
let findeJoinUser;

console.log(user);
const generateRandomString = (num) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.connection = (io, socket) => {
  console.log("접속");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    chatHistory(roomId);
    io.to(roomId).emit("newMessage", message.message, message.nick, profile);
  });

  socket.on("jwt", async ({ token }) => {
    // console.log(`클라이언트로부터 JWT 토큰을 수신: ${token}`);
    //jwt토큰 확인
    try {
      let userId = await vt.verifyToken(token);
      console.log("userId: ", userId);
      const resultValue = await models.User.findOne({
        where: { id: userId },
      }); //회원이 있는지 검증

      userId = console.log("resultValue", resultValue);
      if (!user.includes(resultValue.id)) {
        user.push(resultValue.id);
        profile = resultValue.profile;
        console.log("user", user[0], user[1]);
      }
      socket.emit("jwt", resultValue);
    } catch (error) {
      console.error("토큰 검증 에러:", error);
    }
  });

  //채팅방 만들기 생성
  socket.on("create", async (userId, usernick, roomId) => {
    //join(방이름) 해당 방이름으로 없다면 생성. 존재하면 입장
    console.log(userId, usernick);
    try {
      if (!roomId) {
        console.log("roomName", roomId);
        roomDBInsert = await models.ChatRoom.create({
          roomname: roomId,
        });
      } else {
        //방찾기
        roomFind = await models.ChatRoom.findOne({
          where: { id: roomId },
        });
        //user가 두명이상이면
        if (user.length > 1) {
          findeUser = await models.ChatUser.findOne({
            where: {
              userid: user[0],
              joinuser: user[1],
            },
          });
          if (!findeUser) {
            await chatUserDBInsert();
          }
        }
        socket.room = roomId;
        socket.user = usernick;

        io.to(socket.room).emit("notice", `${socket.user}님이 입장하셨습니다`);
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("sendMessage", async (message) => {
    try {
      const FILE = message.file;
      msg = message.message;
      console.log("sendMessage", message);
      await chatDBInsert(FILE, msg);

      io.to(socket.room).emit(
        "newMessage",
        message.message,
        message.nick,
        profile
      );
      // //자기자신한테 메세지 띄우기
      // socket.emit("newMessage", message.message, message.nick, true);
    } catch (error) {
      console.log("newMessage에러: ", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      socket.leave(socket.room);
    }
  });

  //채팅 유저DB 삽입
  async function chatUserDBInsert() {
    let joinUserId;
    console.log("joinuser", user[1]);

    joinUserId = await models.User.findOne({
      where: {
        id: user[1],
      },
    }).then((result) => {
      console.log("joinusernick", result);
      return result;
    });

    if (!roomFind.roomid) {
      await models.ChatUser.create({
        roomid: roomFind.id,
        userid: user[0],
        joinuser: user[user.length - 1],
        joinusernick: joinUserId.nickname,
      }).then((result) => {
        console.log("chatUserDBInsert", result);
      });
    } else {
      console.log("chatUserDBInsert null");
    }
  }

  //채팅대화 DB 삽입
  async function chatDBInsert(FILE, msg) {
    if (roomDBInsert) {
      await models.Chat.create({
        userid: user[0],
        roomid: roomFind.id,
        CONTENT: msg,
        FILE: FILE,
      }).then((result) => {
        console.log("chatDBInsert", result);
      });
    } else {
      console.log("chatDBInsert null");
    }
  }

  //채팅 히스토리
  function chatHistory(roomId) {
    const history = models.Chat.findAll({
      where: {
        roomid: roomId,
      },
    });
    return history;
  }
};
