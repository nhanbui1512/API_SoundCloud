const { SongModel } = require('../models');
const songRepository = require('../Repositories/songRepository');
const playlistRepository = require('../Repositories/playlistRepository');

class HomeController {
  async index(req, res) {
    try {
      // const song = await SongModel.findOne({});
      const song = await playlistRepository.deleteSongs([112, 111, 116], 9, 1);

      return res.json({ data: song });
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new HomeController();
