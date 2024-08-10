const { SongModel } = require('../models');
const songRepository = require('../Repositories/songRepository');

class HomeController {
  async index(req, res) {
    try {
      // const song = await SongModel.findOne({});
      const song = await songRepository.getLikedSongs({
        targetUserId: 433,
        userId: 1,
        page: 1,
        perPage: 30,
      });

      return res.json(song);
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new HomeController();
