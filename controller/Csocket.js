const models = require("../models/index");
const vt = require("../utils/JwtVerifyToken");
const S3 = require("../utils/S3upload");
const randomBytes = require("crypto").randomBytes(2);
// const roomList = [];
const user = [];
let roomName;
let roomFind;

console.log(user);
// const generateRandomString = (num) => {
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
//   let result = "";
//   const charactersLength = characters.length;
//   for (let i = 0; i < num; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// };

exports.connection = (io, socket) => {
  console.log("접속");

  socket.on("joinRoom", async (roomId, joinUserId) => {
    console.log("roomId", roomId);
    try {
      const history = chatHistory(roomId);
      socket.join(roomId);
      // if (!history) {
      //   io.to(roomId).emit("history", null);
      // } else {
      //   io.to(roomId).emit("history", history);
      // }
    } catch (error) {
      console.log(error);
    }
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
        console.log("user", user[0], user[1]);
      }
      socket.emit("jwt", resultValue);
    } catch (error) {
      console.error("토큰 검증 에러:", error);
    }
  });

  //채팅방 만들기 생성
  socket.on(
    "create",
    async (
      userId,
      usernick,
      roomId,
      requestUserId,
      joinUserNick,
      parkingName
    ) => {
      console.log(userId, usernick, requestUserId, joinUserNick, parkingName);
      try {
        if (!roomId) {
          roomName = "room" + userId + "_" + requestUserId;
          console.log("roomName", roomId);
          roomFind = await models.ChatRoom.findOne({
            roomname: roomName,
          });

          if (!roomFind) {
            roomDBInsert = await models.ChatRoom.create({
              roomname: roomName,
              shareparkname: parkingName,
            });
          }
        }
        await chatUserDBInsert(userId, requestUserId, joinUserNick);
        socket.room = roomId;
        socket.user = usernick;

        io.to(socket.room).emit("notice", `${socket.user}님이 입장하셨습니다`);
      } catch (error) {
        console.log(error);
      }
    }
  );

  socket.on("sendMessage", async (message) => {
    try {
      console.log("sendMessage", message);
      //userid와 다른아이디 찾기
      const joinUserId = user.indexOf(message.userid);

      const joinUserProfile = await models.User.findOne({
        where: { id: message.userid },
      }); //회원이 있는지 검증
      //메세지 DB삽입
      await chatDBInsert(message);
      io.to(socket.room).emit(
        "newMessage",
        message.message,
        message.nick,
        joinUserProfile.profile
      );
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
  async function chatUserDBInsert(userId, requestUserId, joinUserNick) {
    console.log("joinuser", userId, requestUserId, joinUserNick);
    const findUserChat = await models.ChatUser.findOne({
      userid: userId,
      joinuser: requestUserId,
    });

    if (!findUserChat) {
      await models.ChatUser.create({
        roomid: roomFind.id,
        userid: userId,
        joinuser: requestUserId,
        joinusernick: joinUserNick,
      });
    }
  }

  //채팅대화 DB 삽입
  async function chatDBInsert(data) {
    try {
      const chatDB = await models.Chat.create({
        userid: data.userid,
        roomid: roomFind.id,
        content: data.message,
        FILE: data.file,
      });
    } catch (error) {
      console.log(error, "chatDBInsert null");
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
