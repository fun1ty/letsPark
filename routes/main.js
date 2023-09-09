const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();

router.get('/', controller.main);

router.post('/', controller.getInfo);

router.get("/ppdb", controller.ppdb);

router.get("/chat", controller.chat);

module.exports = router;
