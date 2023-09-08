const jwt = require('jsonwebtoken');

exports.verifyToken = (token) => {
    let userId;
    jwt.verify(token, SECRETKEY, (err, decoded) => {
        if(err)
            return false;
        userId = decoded.id;
    });

    return userId;
}

