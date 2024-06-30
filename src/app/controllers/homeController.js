const { SongModel } = require('../models');

class HomeController {
  async index(req, res) {
    try {
      const song = await SongModel.findOne({});
      return res.status(200).json({
        message: 'Server is ready',
        status: 200,
        testData: song,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Internal Error',
        testData: {},
      });
    }
  }
}
module.exports = new HomeController();
