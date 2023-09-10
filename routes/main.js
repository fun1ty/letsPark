const express = require("express");
const controller = require("../controller/Cmain");
const router = express.Router();

router.get("/", controller.main);
router.post("/chat", controller.chat);

router.get("/ppdb", controller.ppdb);

module.exports = router;
