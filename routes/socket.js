const controller = require("../controller/Csocket");
const upload = require("../utils/S3upload");

module.exports = function socketConn(io) {
  io.on("connection", (socket) => {
    controller.connection(io, socket);
  });
};
