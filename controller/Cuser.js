const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//쿠키 설정
const cookieConfig = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, //24시간으로 설정
};
const SECRET = 'mySecret'; //토큰키

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
    console.log(error);
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
      //req.session.user = user;
      //JWT토큰 생성
      const token = jwt.sign({ userid: user.userid }, SECRET, {
        expiresIn: '24h',
      }); //토큰 유효 기간 (24시간)
      res.json({ result: true, token });
    } else {
      res.json({ result: false, message: '비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.log(error);
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
  console.log(req.headers.authorization);
  const [bearer, token] = req.headers.authorization.split(' ');

  if (bearer === 'Bearer') {
    try {
      const result = jwt.verify(token, SECRET);

      User.findOne({ where: { userid: result.userid } }).then((user) => {
        if (!user) {
          res.json({ result: false, message: '사용자가 존재하지 않습니다.' });
        } else {
          User.update(
            {
              // 비밀번호 수정 시, 암호화 필요
              password: bcryptPassword(password),
              name,
              nickname,
              phone,
            },
            { where: { userid: result.userid } }
          )
            .then(() => {
              res.json({ result: true });
            })
            .catch((error) => {
              console.log(error);
              res
                .status(500)
                .json({
                  result: false,
                  message: '프로필 수정에 실패했습니다.',
                });
            });
        }
      });
    } catch (error) {
      console.log(error);
      res.json({ result: false, message: '토큰 검증에 실패했습니다.' });
    }
  } else {
    res.json({ result: false, message: '인증방식이 틀렸습니다. ' });
  }
};
//   User.findOne({ where: { userid: userid } })
//     .then((user) => {
//       if (!user) {
//         res.json({ result: false, message: '사용자가 존재하지 않습니다.' });
//       } else {
//         User.update(
//           {
//             password: bcryptPassword(password),
//             name,
//             nickname,
//             phone,
//           },
//           { where: { userid: userid } }
//         )
//           .then(() => {
//             res.json({ result: true });
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//       res
//         .status(500)
//         .json({ result: false, message: '프로필 수정에 실패했습니다.' });
//     });
// };

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
