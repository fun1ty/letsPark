const controller = require("../controller/socket");

module.exports = function (io) {
  // 클라이언트 연결 이벤트 핸들링
  io.on("connection", (socket) => {
    controller.connection(io.of("/chat"), socket);
  });
};
