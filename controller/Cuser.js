const { User } = require('../models');
const bcrypt = require('bcrypt');
const saltNumber = 10;

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
exports.verify = (req, res) => {
  res.render('verify');
};

exports.profile = async (req, res) => {
  try {
    const { userid } = req.params;

    // 사용자 정보를 DB에서 조회
    const user = await User.findOne({
      where: { userid: userid },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.render('profile', { user });
  } catch (error) {
    console.log(error);
  }
};

//POST
exports.postSignup = async (req, res) => {
  try {
    const { userid, password, name, nickname, phone } = req.body;
    const hashPw = bcryptPassword(password);

    const user = await User.create({
      userid,
      password: hashPw,
      name,
      nickname,
      phone,
    });
    res.json({ result: true, data: user }); // 회원가입 성공 시 사용자 정보를 반환
  } catch (error) {
    res
      .status(500)
      .json({ result: false, message: '회원가입에 실패했습니다.' });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { userid, password } = req.body;
    //사용자 조회
    const user = await User.findOne({
      where: { userid: userid },
    });
    if (!user) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다.' });
    }
    //비밀번호 확인
    const compare = comparePassword(password, user.password);
    if (compare) {
      res.cookie('isLoggin', true, cookieConfig);
      req.session.user = user;
      res.json({ result: true });
    } else {
      res.json({ result: false, message: '비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: '로그인에 실패했습니다.' }); // 로그인 실패
  }
};

const bcryptPassword = (pw) => {
  return bcrypt.hashSync(pw, 10);
};
const comparePassword = (pw, dbPw) => {
  return bcrypt.compareSync(pw, dbPw);
};

//PATCH
exports.editProfile = (req, res) => {
  const { userid, password, name, nickname, phone } = req.body;
  User.findOne({ where: { userid: userid } })
    .then((user) => {
      if (!user) {
        res.json({ result: false, message: '사용자가 존재하지 않습니다.' });
      } else {
        User.update(
          {
            password: bcryptPassword(password),
            name,
            nickname,
            phone,
          },
          { where: { userid: userid } }
        )
          .then(() => {
            res.json({ result: true });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ result: false, message: '프로필 수정에 실패했습니다.' });
    });
};

//DELETE
exports.drop = (req, res) => {
  const { userid } = req.body;
  User.destroy({
    where: { userid },
  })
    .then(() => {
      res.clearCookie('isLoggin'); // 오타 수정: 'isLoggin' 대신 'isLoggin'으로 변경
      req.session.destroy(); // 세션 삭제
      res.json({ result: true });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ result: false, message: '사용자 삭제에 실패했습니다.' });
    });
};
