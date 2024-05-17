const { UserModel, SongModel } = require('../models');

class HomeController {
  async index(req, res) {
    const song = await SongModel.findOne({
      include: {
        model: UserModel,
      },
    });
    if (song !== null)
      return res.status(200).json({
        message: 'Server is ready',
        status: 200,
      });
    else
      return res.status(500).json({
        status: 500,
        message: 'Internal Error',
      });
  }
}
module.exports = new HomeController();
