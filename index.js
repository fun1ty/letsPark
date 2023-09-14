const http = require("http");
const express = require("express");
const SocketIO = require("socket.io");
const db = require("./models");
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

app.set("view engine", "ejs");
app.use("/uploads", express.static(__dirname + "/uploads"));

//body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
const indexRouter = require("./routes/main");
app.use("/", indexRouter);

const socketRouter = require("./routes/socket");
socketRouter(io);

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const mypageRouter = require("./routes/mypage");
app.use("/mypage", mypageRouter);

const publicParkingRouter = require("./routes/publicParking");
app.use("/publicparking", publicParkingRouter);

const shareParkingRouter = require("./routes/shareParking");
app.use("/shareparking", shareParkingRouter);

const parkingPayRouter = require("./routes/parkingPay");
app.use("/parkingpay", parkingPayRouter);

//404
app.get("*", (req, res) => {
  res.render("404");
});

//job import(스케줄 js파일 추가 -> 자동 실행)
const updateInfoJob = require("./utils/schedule");

//server start
db.sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});
