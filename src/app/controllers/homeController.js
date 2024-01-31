const { UserModel, SongModel } = require('../models');

class HomeController {
  async index(req, res) {
    const song = await SongModel.findOne({
      include: {
        model: UserModel,
      },
    });
    return res.status(200).json({
      data: song,
    });
  }
}
module.exports = new HomeController();
