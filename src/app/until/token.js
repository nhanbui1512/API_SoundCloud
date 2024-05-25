const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  GenerateAccpectToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        userName: user.userName,
        email: user.email,
      },
      process.env.JWT_PASS,
      {
        expiresIn: '1d',
      },
    );
  },

  GenerateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        userName: user.userName,
        email: user.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '30d',
      },
    );
  },
};
