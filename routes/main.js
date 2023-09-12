const express = require("express");
const controller = require("../controller/Cmain");
const router = express.Router();

router.post('/', controller.getInfo);

router.get('/', controller.main);
router.get('/chat', controller.chat);

router.get('/ppdb', controller.ppdb);

module.exports = router;
