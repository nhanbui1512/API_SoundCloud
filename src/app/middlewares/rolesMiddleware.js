const { UserModel, RoleModel } = require('../models');
const AuthorizeError = require('../errors/AuthorizeError');
const NotFoundError = require('../errors/NotFoundError');

const adminAuth = async (req, res, next) => {
  const adminAuth = await RoleModel.findOne({
    where: {
      name: 'Admin',
    },
  });

  if (adminAuth === null) throw new NotFoundError({ message: 'Not found admin role' });

  const userId = req.userId;
  const user = await UserModel.findOne({ where: { id: userId, roleId: adminAuth.id } });

  if (user === null) throw new AuthorizeError({ message: 'Must be admin authorization' });
  next();
};

module.exports = {
  adminAuth,
};
