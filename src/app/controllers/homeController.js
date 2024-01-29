const { error } = require('console');
const { UserModel, SongModel } = require('../models');
// const cloudinary = require('cloudinary').v2;

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
