const playlistRepository = require('../Repositories/playlistRepository');

class HomeController {
  async index(req, res) {
    try {
      // const song = await SongModel.findOne({});
      const data = await playlistRepository.getById(10, 1);
      return res.json({ data: data });
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new HomeController();
