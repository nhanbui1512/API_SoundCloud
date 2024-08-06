const { StatusCodes } = require('http-status-codes');
const AuthorizeError = require('../errors/AuthorizeError');

require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, response, next) => {
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
      if (error.name === 'TokenExpiredError') {
        throw new AuthorizeError({ message: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        throw new AuthorizeError({ message: 'Invalid token' });
      } else {
        return response.status(500).json({ error: 'Internal server error', status: 500 });
      }
    }
  } else {
    throw new AuthorizeError({
      authorize: 'No token provided',
    });
  }
};

module.exports = authMiddleware;
