const models = require("../models/index");
const jwt = require("jsonwebtoken");
const vt = require("../utils/JwtVerifyToken");
const roomList = [];

exports.connection = (io, socket) => {
  try {
    console.log("접속");
    //채팅방 목록 보내기
    // socket.emit("roomList", roomList);

    //채팅방 만들기 생성
    socket.on("create", async (roomName, userName, cb) => {
      //join(방이름) 해당 방이름으로 없다면 생성. 존재하면 입장
      //socket.rooms에 socket.id값과 방이름 확인가능
      socket.join(roomName);
      //socket은 객체이며 원하는 값을 할당할 수 있음
      socket.room = roomName;
      socket.user = userName;
      //jwt토큰 확인
      const token = req.headers.authorization.split(" ")[1];
      //토큰 인증
      const userId = vt.verifyToken(token);
      const resultValue = User.findOne({
        where: { id: userId },
      }); //회원이 있는지 검증
      console.log(result);

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
  } catch (error) {
    console.log("roomList에러: ", error);
  }

  socket.on("sendMessage", (message) => {
    try {
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
    } catch (error) {
      console.log("newMessage에러: ", error);
    }
  });

  socket.on("sendMessage", (message) => {
    try {
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
    } catch (error) {
      console.log("sendMessage에러: ", error);
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
