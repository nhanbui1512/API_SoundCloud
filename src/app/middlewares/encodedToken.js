require('dotenv').config();
const jwt = require('jsonwebtoken');
const enCodedToken = (req, response, next) => {
  const authHeader = String(req.headers['authorization'] || '');

  //nếu có authHeader
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    var decode = jwt.verify(token, process.env.JWT_PASS);
    req.userId = decode.userId;
    req.email = decode.email;
    req.userName = decode.userName;
  }

  next();
};

module.exports = enCodedToken;
