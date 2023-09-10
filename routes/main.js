const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();


router.post("/", controller.getInfo);


const jwt = require('jsonwebtoken');
const SECRET = 'SECRET';
//토큰 검증 함수
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('jwt : ', authHeader);

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7); // "Bearer " 이후의 부분 추출

    // JWT 토큰 검증
    jwt.verify(token, 'SECRET', (err, user) => {
      if (err) {
        console.log('토큰 검증 실패', err); // 토큰 검증 실패 시 403 에러 반환
      } else {
        req.user = user; // 토큰 검증 성공 시 사용자 정보를 요청 객체에 추가
        console.log(req.user);
        console.log('토큰 검증 성공');
        next();
      }
    });
  } else {
    req.user = {};
    next();
  }
};

router.get('/', authenticateToken, controller.main);
router.get('/chat', controller.chat);

router.get('/ppdb', controller.ppdb);


module.exports = router;
