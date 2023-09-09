const express = require("express");
const controller = require("../controller/Cmain");
const router = express.Router();

router.get("/", controller.main);
router.get("/chat", controller.chat);

router.get("/ppdb", controller.ppdb);
router.get("/parking", controller.parking);

module.exports = router;
