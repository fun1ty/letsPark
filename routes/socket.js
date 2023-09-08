const controller = require("../controller/Csocket");

module.exports = function socketConn(io) {
  io.on("connection", (socket) => {
    controller.connection(io, socket);
  });
};
