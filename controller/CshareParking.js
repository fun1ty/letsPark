const models = require("../models/index");

//공유주차장 상세페이지 이동
exports.detail = async (req, res) => {
    const id = req.query.id;
    try {
        const result = await models.ShareParking.findOne({
            where : { id },
        });

        res.send({ result });
    } catch (error) {
        console.log(error);
    }
};

//공유주차장 등록 페이지 이동
exports.shareParking = async (req, res) => {
    const id = req.query.id;
    try {
        const result = await models.User.findOne({
            attributes : ['phone'],
           where : { id },
        });

        res.render('', { result });
    } catch (error) {
        console.log(error);
    }
}

exports.test = async (req, res) => {
    res.render('test');
}
//공유주차장 등록
exports.enrollShareParking = async (req, res) => {
    //jwt 토큰인증 추가해야함
    const location = req.file.location;
    console.log(req.body);
    const {shareparkname, address, starttime, endtime, price, lat, lng} = req.body;

    try {
        const result = await models.ShareParking.create({
            shareparkname, address, starttime, endtime, price, lat, lng, location,
            status : 'Y',
        });

        console.log(result);
    } catch (err) {
        console.log(err);
    }

};