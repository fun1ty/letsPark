const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/', controller.main);
router.get('/chat', controller.chat);

router.get('/ppdb', controller.ppdb);

module.exports = router;
