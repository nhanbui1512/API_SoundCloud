const ValidationError = require('../errors/ValidationError');
const { PlayListModel } = require('../models');

class PlayListController {
  async createPlaylist(req, response) {
    const userId = req.userId;
    const errors = [];
    const name = req.body.name;
    if (!name) errors.push({ message: 'Name must be attached' });

    if (errors.length > 0) throw new ValidationError(errors);

    const isExist = await PlayListModel.findOne({
      where: {
        userId: userId,
        name: name,
      },
    });

    if (isExist) {
      return response.status(400).json({
        result: false,
        message: 'Name is exist',
      });
    } else {
      const newPlaylist = await PlayListModel.create({
        name: name,
        userId: userId,
      });
      return response.status(200).json({
        result: true,
        newData: newPlaylist,
      });
    }
  }

  async getAllPlaylist(req, response) {
    const userId = req.userId;
    if (userId) {
      const playlists = await PlayListModel.findAll();
      return response.status(200).json({
        result: true,
        data: playlists,
      });
    } else {
      throw new ValidationError({ message: 'User not found' });
    }
  }
}

module.exports = new PlayListController();
