const express = require("express");
const controller = require("../controller/Cmain");
const router = express.Router();

router.post("/", controller.getInfo);

router.get("/", controller.main);
router.get("/data", controller.userData);
router.get("/chat/:userId/:joinUserNick/:parkingName", controller.requestChat);
router.get("/chat/:roomId/:joinUser/:parkingName", controller.chat);
router.get("/chatList/:userId", controller.chatList);
router.get("/ppdb", controller.ppdb);

module.exports = router;
