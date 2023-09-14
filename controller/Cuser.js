const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const vt = require('../utils/JwtVerifyToken');
const { RDS } = require('aws-sdk');
require('dotenv').config();
const env = process.env;
const SECRETKEY = env.SECRETKEY;
//쿠키 설정
const cookieConfig = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, //24시간으로 설정
};

//GET
exports.signup = (req, res) => {
  res.render('signup');
};
exports.login = (req, res) => {
  const { userid } = req.params;
  res.render('login', { userid });
};
exports.success = (req, res) => {
  const { userid, nickname } = req.params;
  res.render('success', { userid, nickname });
};
exports.profile = async (req, res) => {
  console.log(req.params);

  User.findOne({
    where: { userid: req.params.userid },
  }).then((result) => {
    res.render('profile', { data: result });
  });
};
exports.edit = async (req, res) => {
  User.findOne({
    where: { userid: req.params.userid },
  }).then((result) => {
    res.render('profileEdit', { data: result });
  });
};
exports.idCheck = async (req, res) => {
  const { userid } = req.params;
  console.log(userid);

  try {
    const user = await User.findOne({ where: { userid } });

    if (user) {
      res.json({ result: false }); // 아이디 중복
    } else {
      res.json({ result: true }); // 사용 가능한 아이디
    }
  } catch (error) {
    console.error('데이터베이스 조회 오류:', error);
    res.status(500).json({ result: false, message: '서버 오류' });
  }
};

//POST
exports.postSignup = async (req, res) => {
  console.log(req.body);
  try {
    const { userid, password, name, nickname, phone } = req.body;
    console.log('testcheck');
    const hashPw = await bcryptPassword(password);
    console.log(hashPw);

    let profilePicLocation =
      'https://kdt8-cs.s3.ap-northeast-2.amazonaws.com/%EC%A3%BC%EC%B0%A8%ED%95%98%EC%B9%B4_icon/profile.svg';

    if (req.file) {
      // 이미지를 선택한 경우
      profilePicLocation = req.file.location;
    }

    const user = await User.create({
      userid,
      password: hashPw,
      name,
      nickname,
      phone,
      profile: profilePicLocation,
    });
    res.json({ result: true, data: user }); // 회원가입 성공 시 사용자 정보를 반환
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ result: false, message: '회원가입에 실패했습니다.' });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { id, userid, password, name, nickname } = req.body;
    const user = await User.findOne({
      where: { userid },
    });

    if (user) {
      const result = await comparePassword(password, user.password);
      if (result) {
        res.cookie('isLoggin', true, cookieConfig);
        const token = jwt.sign(
          {
            id: user.id,
            userid: userid,
            nickname: user.nickname,
            name: user.name,
          },
          SECRETKEY
        );
        res.json({ result: true, token, data: user });
      } else {
        res.json({ result: false, message: '비밀번호가 틀렸습니다.' });
      }
    } else {
      res.json({ result: false, message: '존재하는 사용자가 없습니다.' });
    }
  } catch (error) {
    console.log('로그인 오류', error);
  }
};

//PATCH
exports.editProfile = (req, res) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.json({ result: false, message: '인증되지 않은 요청입니다.' });
  }
  try {
    const decodedToken = jwt.verify(token, SECRETKEY);
    const { userid, newPassword, name, nickname, phone, profileImage } =
      req.body;

    User.findOne({ where: { userid: decodedToken.userid } }).then((user) => {
      if (!user) {
        res.json({ result: false, message: '사용자가 존재하지 않습니다.' });
      } else {
        if (newPassword) {
          // 새 비밀번호가 제공된 경우에만 업데이트
          const hashNewPassword = bcrypt.hashSync(newPassword, 10);
          user.password = hashNewPassword;
        }

        if (req.file) {
          // 업로드된 이미지 파일이 있는 경우
          const imagePath = req.file.location; // 업로드된 파일의 경로
          console.log('imagePath', imagePath);
          user.profile = imagePath; // 이미지 경로를 프로필 이미지 URL로 업데이트
        }
        User.update(
          {
            password: user.password,
            name,
            nickname,
            phone,
            profile: user.profile,
          },
          { where: { userid: decodedToken.userid } }
        )
          .then(() => {
            res.json({ result: true });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({
              result: false,
              message: '프로필 수정에 실패했습니다.',
            });
          });
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, message: '토큰 검증에 실패했습니다.' });
  }
};

//DELETE
exports.drop = (req, res) => {
  const { userid } = req.body;
  User.destroy({
    where: { userid },
  })
    .then(() => {
      res.clearCookie('isLoggin');
      //req.session.destroy();
      res.json({ result: true });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ result: false, message: '사용자 삭제에 실패했습니다.' });
    });
};

const bcryptPassword = (pw) => {
  console.log('pw', pw);
  return bcrypt.hash(pw, 10);
};
const comparePassword = (pw, dbPw) => {
  return bcrypt.compare(pw, dbPw);
};
