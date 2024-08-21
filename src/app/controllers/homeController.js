const { SongModel } = require('../models');
const songRepository = require('../Repositories/songRepository');
const playlistRepository = require('../Repositories/playlistRepository');
const followRepository = require('../Repositories/followRepository');

class HomeController {
  async index(req, res) {
    try {
      // const song = await SongModel.findOne({});
      const data = await playlistRepository.getPlaylists({ page: 1, perPage: 10 });
      return res.json({ data: data });
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new HomeController();
