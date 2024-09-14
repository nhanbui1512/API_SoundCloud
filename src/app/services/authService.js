const { AuthProviderModel, UserModel } = require('../models');
const { GenerateAcessToken, GenerateRefreshToken } = require('../until/token');

const createNewUserAuth = async ({ email, userName, picture, providerUserId, providerName }) => {
  try {
    const newUser = await UserModel.create({
      email,
      userName,
      password: null,
      avatar: picture,
      roleId: 2,
    });

    await AuthProviderModel.create({
      providerName,
      providerUserId,
      userId: newUser.id,
    });

    const refreshToken = GenerateRefreshToken(newUser);
    const accessToken = GenerateAcessToken(newUser);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    const userData = newUser.toJSON();
    delete userData.refreshToken;
    delete userData.password;

    return { user: userData, token: accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNewUserAuth,
};
