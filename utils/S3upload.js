
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require('aws-sdk');

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        acl: "public-read", //파일접근권한 (public-read로 해야 업로드된 파일이 공개)
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "-" + file.originalname);
        },
    }),
});

module.exports = upload;