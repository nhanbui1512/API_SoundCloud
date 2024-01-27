const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const {
  PlayListModel,
  FollowPlaylistModel,
  UserModel,
  SongPlaylistModel,
  SongModel,
} = require('../models');

const { createSongPlaylist } = require('../until/songPlaylist');

class PlayListController {
  async createPlaylist(req, response) {
    const userId = req.userId;
    const errors = [];
    const name = req.body.name;
    const idSongs = req.body.idSongs;

    if (idSongs.length < 0) errors.push({ message: 'IdPlaylist must be attached' });
    if (!name) errors.push({ message: 'Name must be attached' });

    if (errors.length > 0) throw new ValidationError(errors);

    const isExist = await PlayListModel.findOne({
      where: {
        userId: userId,
        name: name,
      },
    });

    if (isExist !== null) {
      return response.status(400).json({
        result: false,
        message: 'Name is exist',
      });
    } else {
      const newPlaylist = await PlayListModel.create({
        name: name,
        userId: userId,
      });

      await createSongPlaylist(idSongs, newPlaylist.toJSON().id);

      return response.status(200).json({
        result: true,
        newData: newPlaylist,
      });
    }
  }

  async addSongsToPlaylist(req, response) {
    const idPlaylist = req.query.idPlaylist;
    const idSongs = req.body.idSongs;
    if (!idPlaylist) throw new ValidationError({ message: 'IdPlaylist must be attached' });

    const playList = await PlayListModel.findOne({
      where: {
        userId: userId,
      },
    });

    if (playList === null) throw new NotFoundError({ playlist: 'Not found' });

    await createSongPlaylist(idSongs, idPlaylist); // add relationship song playlist

    const PlayList = await SongPlaylistModel.findAll({
      where: {
        playlistId: idPlaylist,
      },
      include: [
        {
          model: SongModel,
          as: 'song',
        },
        {
          model: PlayListModel,
          as: 'playlist',
        },
      ],
    });

    if (PlayList) {
      return response.status(200).json({
        result: true,
        data: PlayList,
      });
    } else {
      return response.status(422).json({
        result: false,
        message: 'Playlist not found',
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

  async getPlaylistById(req, response) {
    const idPlaylist = req.query.idPlaylist;
    const playlist = await PlayListModel.findOne({
      where: {
        id: idPlaylist,
      },
    });
    if (playlist) {
      return response.status(200).json({
        result: true,
        data: playlist,
      });
    } else {
      return response.status(422).json({
        result: true,
        message: 'Playlist not found',
      });
    }
  }

  async deletePlaylistById(req, response) {
    const idPlaylist = req.query.idPlaylist;
    const playlist = await PlayListModel.destroy({
      where: {
        id: idPlaylist,
      },
    });
    return response.status(200).json({
      result: true,
      data: playlist,
    });
  }

  async MyPlaylists(req, response) {
    const userId = req.userId;

    if (userId) {
      const playlistFollow = await FollowPlaylistModel.findAll({
        where: {
          userId: userId,
        },
        attributes: {
          exclude: ['userId', 'id'],
        },
        include: [
          {
            model: PlayListModel,
            as: 'followingPlaylist',
          },
        ],
      });
      return response.status(200).json({
        result: true,
        data: playlistFollow,
      });
    } else {
      throw new ValidationError({ message: 'User not found' });
    }
  }

  async getUserFollowPlaylist(req, response) {
    const playlistId = req.query.idPlaylist;
    const Users = await FollowPlaylistModel.findAll({
      where: {
        playlistId: playlistId,
      },
      attributes: {
        exclude: ['userId', 'id'],
      },
      include: [
        {
          model: UserModel,
          as: 'followingUser',
        },
      ],
    });

    if (Users) {
      return response.status(200).json({
        result: true,
        data: Users,
      });
    } else {
      return response.status(422).json({
        result: false,
        data: [],
      });
    }
  }
}

module.exports = new PlayListController();
