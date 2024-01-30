const { UserModel, SongModel, sequelize } = require('../models');
const { encrypt, decrypt } = require('../until/encode');
const { multiSqlizeToJSON } = require('../until/sequelize');

class HomeController {
  async index(req, res) {
    const song = await SongModel.findOne({
      include: {
        model: UserModel,
      },
    });

    // sequelize
    //   .transaction(async (t) => {
    //     await Promise.all(
    //       users.map(async (userData) => {
    //         await UserModel.update(userData, { where: { id: userData.id }, transaction: t });
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
