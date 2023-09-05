const http = require("http");
const express = require("express");
const db = require("./models");
const SocketIO = require("socket.io"); //웹소켓
const jwt = require("jsonwebtoken"); //JWT토큰
const SECRET = "secretKey"; //secret키 설정
const multer = require("multer");
const path = require("path");
const aws = require("aws-sdk"); //aws설정을 위한 모듈
const multerS3 = require("multer-s3"); //aws s3에 업로드 하기위한 multer설정
const dotenv = require("dotenv");
dotenv.config();

const PORT = 8000;
const app = express();

const server = http.createServer(app);
const io = SocketIO(server);
const chatNamespace = io.of("/chat");

app.set("view engine", "ejs");
app.use("/uploads", express.static(__dirname + "/uploads"));

//body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// const io = SocketIO(server, {
//   cors: {
//     origin: "/chat",
//     methods: ["GET", "POST"],
//   },
// });

//정적파일 설정 (외부에서 내부파일로 접근할때)
app.use(express.static("static/css"));

//aws s3 인스턴스 생성
const s3 = new aws.S3();

//aws 설정
aws.config.update({
  accessKeyId: process.env.S3_KEYID,
  secretAccessKey: process.env.S3_ACCESSKEY,
  region: process.env.S3_REGION,
});

//router 파일
const indexRouter = require("./routes/main.js"); //index.js 생략
app.use("/", indexRouter);

const socketRouter = require("./routes/socket.js");
socketRouter(chatNamespace);

// const indexRouter = require("./routes/user.js"); //index.js 생략
// app.use("/user", indexRouter);

// const indexRouter = require("./routes/parking.js"); //index.js 생략
// app.use("/parking", indexRouter);

//404
app.get("*", (req, res) => {
  res.render("404");
});

//server start
db.sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});