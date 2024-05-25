const AuthorizeError = require('../errors/AuthorizeError');

require('dotenv').config();
const jwt = require('jsonwebtoken');

const isLoginMiddleWare = (req, response, next) => {
  const authHeader = String(req.headers['authorization'] || '');

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      var decode = jwt.verify(token, process.env.JWT_PASS);
      req.userId = decode.userId;
      req.email = decode.email;
      req.userName = decode.userName;
      next();
    } catch (error) {
      throw new AuthorizeError({ authorize: 'Must be Login' });
    }
  } else {
    throw new AuthorizeError({
      authorize: 'Must be Login',
    });
  }
};

module.exports = isLoginMiddleWare;
