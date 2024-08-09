const { SongModel } = require('../models');
const songRepository = require('../Repositories/songRepository');

class HomeController {
  async index(req, res) {
    try {
      // const song = await SongModel.findOne({});
      const song = await songRepository.getSongs({
        page: 1,
        perPage: 10,
        userId: 1,
        sort: 'listen_asc',
        search: 'Đừng làm trái tim anh đau',
      });
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
