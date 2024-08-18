const { SongModel } = require('../models');
const songRepository = require('../Repositories/songRepository');
const playlistRepository = require('../Repositories/playlistRepository');
const followRepository = require('../Repositories/followRepository');

class HomeController {
  async index(req, res) {
    try {
      // const song = await SongModel.findOne({});
      const followers = await followRepository.getFollowers(11, 1);

      return res.json({ data: followers });
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new HomeController();
