const models = require("../models/index");
const vt = require("../utils/JwtVerifyToken");
const S3 = require("../utils/S3upload");
const { Op } = require("sequelize");
// const randomBytes = require("crypto").randomBytes(2);
// const roomList = [];
const user = [];
let roomName;
let roomFind;
// const joinedUsers = {};
const rooms = {};
const clientUserIds = {};

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

  socket.on("jwt", async ({ token }) => {
    //jwt토큰 확인
    try {
      let userId = await vt.verifyToken(token);
      console.log("userId: ", userId);
      //회원이 있는지 검증
      const resultValue = await UserInfo(userId);

      userId = console.log("resultValue", resultValue);
      if (!user.includes(resultValue.id)) {
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
      try {
        roomName = "room" + "_" + userId + "_" + requestUserId;
        if (!roomId) {
          roomFind = await models.ChatRoom.findOne({
            roomname: roomName,
          });

          if (!roomFind) {
            roomFind = await models.ChatRoom.create({
              roomname: roomName,
              shareparkname: parkingName,
            });
          }
        }
        await chatUserDBInsert(userId, requestUserId, joinUserNick);
        socket.user = usernick;
        socket.join(roomFind.id);
        socket.room = roomFind.id;

        // //이미 입장한 사용자인지 확인
        // if (!joinedUsers[socket.room]) {
        //   // 입장한 사용자를 추적
        //   joinedUsers[socket.room] = true;

        // 방 정보 저장
        if (!rooms[socket.room]) {
          rooms[socket.room] = [];
        }
        rooms[socket.room].push(socket);

        // 클라이언트의 UserId 저장
        if (!clientUserIds[socket.id]) {
          clientUserIds[socket.id] = userId;
        }
        socket
          .to(socket.room)
          .emit("notice", socket.room, `${usernick}님이 입장하셨습니다`);
        socket.emit("roomNumber", roomFind.id);

        const history = await chatHistory(socket.room);
        if (history) {
          // 이 부분에서 방에 입장한 모든 사용자에게 채팅 내역을 전송합니다.
          const userIdFind = await chatUserFind(socket.room);
          let UserResult;
          if (userId != userIdFind.userid) {
            UserResult = await UserInfo(userIdFind.userid);
          } else {
            UserResult = await UserInfo(userIdFind.joinuser);
          }
          UserResult = await UserInfo(userIdFind.userid);
          // io.to(socket.room).emit("history", history, UserResult);
          // 해당 방의 모든 클라이언트에게 채팅 내역 전송
          rooms[socket.room].forEach((clientSocket) => {
            // 클라이언트 소켓의 UserId와 현재 클라이언트의 UserId가 같으면 채팅 내역 전송
            if (clientUserIds[clientSocket.id] === userId) {
              clientSocket.emit("history", history, UserResult);
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  socket.on("findHistory", async (roomId, userId, lastMessageId) => {
    const userIdFind = await chatUserFind(roomFind.id);
    let UserResult;
    if (userId != userIdFind.userid) {
      UserResult = await UserInfo(userIdFind.userid);
    } else {
      UserResult = await UserInfo(userIdFind.joinuser);
    }
    // if (!requestedHistories[userId]) {
    const history = await chatHistory(roomId, lastMessageId);
    if (!history) {
      console.log("historyNull");
    } else {
      console.log("aaaa", roomId);
      io.to(roomId).emit("history", history, UserResult);
    }
  });

  socket.on("sendMessage", async (message) => {
    try {
      const joinUser = await UserInfo(message.userid);
      //메세지 DB삽입
      await chatDBInsert(message);

      io.to(socket.room).emit(
        "newMessage",
        message.message,
        message.nick,
        joinUser.profile
      );
      // // 채팅 히스토리를 업데이트
      // const history = await chatHistory(socket.room);
      // io.to(socket.room).emit("history", history, joinUser);
    } catch (error) {
      console.log("newMessage에러: ", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      socket.leave(socket.room);
    }
  });

  ///채팅유저 찾기
  async function chatUserFind(roomId) {
    console.log("chatUserFindroomId", roomId);
    const findUserChat = await models.ChatUser.findOne({
      roomid: roomId,
    });
    return findUserChat;
  }

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

  //사람정보 찾기
  async function UserInfo(usereid) {
    const UserInfoResult = await models.User.findOne({
      where: { id: usereid },
    });
    return UserInfoResult;
  }

  //채팅대화 DB 삽입
  async function chatDBInsert(data) {
    try {
      await models.Chat.create({
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
  async function chatHistory(roomId, lastMessageId) {
    const Condition = {
      roomid: roomId,
    };

    if (lastMessageId !== null) {
      Condition.id = { [Op.gt]: lastMessageId };
    }
    const history = await models.Chat.findAll({
      where: Condition,
      order: [["createdAt", "DESC"]],
    });

    return history;
  }
};
