const { UserModel } = require('../models');
const AuthorizeError = require('../errors/AuthorizeError');

const adminAuth = async (req, res, next) => {
  const userId = req.userId;
  const user = await UserModel.findOne({ where: { id: userId, roleId: 1 } });
  if (user === null) throw new AuthorizeError({ message: 'Must be admin authorization' });
  next();
};

module.exports = {
  adminAuth,
};
