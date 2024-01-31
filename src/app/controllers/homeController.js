const { UserModel, SongModel, sequelize } = require('../models');
const { encrypt, decrypt } = require('../until/encode');
const { multiSqlizeToJSON } = require('../until/sequelize');
const bcrypt = require('bcrypt');

class HomeController {
  async index(req, res) {
    const song = await SongModel.findOne({
      include: {
        model: UserModel,
      },
    });

    // var users = await UserModel.findAll({
    //   attributes: {
    //     include: ['password', 'id'],
    //   },
    // });

    // users = users.map(async (user) => {
    //   user.password = await bcrypt.hash(user.password, 10);
    //   await UserModel.update(
    //     {
    //       password: user.password,
    //     },
    //     {
    //       where: {
    //         id: user.id,
    //       },
    //     },
    //   );
    // });

    // sequelize
    //   .transaction(async (t) => {
    //     await Promise.all(
    //       users.map(async (userData) => {
    //         await UserModel.update(
    //           {
    //             password: userData.password,
    //           },
    //           { where: { id: userData.id }, transaction: t },
    //         );
    //       }),
    //     );
    //   })
    //   .then(() => {
    //     console.log('Cập nhật thành công');
    //   })
    //   .catch((error) => {
    //     console.error('Lỗi khi cập nhật: ', error);
    //   });

    return res.status(200).json({
      data: song,
    });
  }
}
module.exports = new HomeController();
