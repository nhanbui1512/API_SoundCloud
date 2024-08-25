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
const playlistRepository = require('../Repositories/playlistRepository');
const { StatusCodes } = require('http-status-codes');

class PlayListController {
  //#region create playlist
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
  //#endregion

  //#region add songs
  async addSongsToPlaylist(req, response) {
    const userId = req.userId;
    const idPlaylist = req.query.idPlaylist;
    const idSongs = req.body.idSongs;
    if (!idPlaylist) throw new ValidationError({ message: 'IdPlaylist must be attached' });

    const reuslt = await playlistRepository.addSongs(idSongs, idPlaylist, userId);

    const PlayLists = await SongPlaylistModel.findAll({
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

    return response.status(200).json({
      result: true,
      data: PlayLists,
    });
  }
  //#endregion

  //#region update playlist
  async updatePlaylist(req, response) {
    const userId = req.userId;
    const playlistId = Number(req.query.playlistId);
    const name = req.query.name;

    const result = await playlistRepository.update(name, playlistId, userId);

    return response.status(200).json({ isSuccess: true, data: result });
  }
  //#endregion

  //#region remove songs
  async removeSongsToPlaylist(req, response) {
    const userId = req.userId;
    const idPlaylist = req.query.idPlaylist;
    const idSongs = req.body.idSongs;
    if (!idPlaylist) throw new ValidationError({ message: 'IdPlaylist must be attached' });

    await playlistRepository.deleteSongs(idSongs, idPlaylist, userId);

    var PlayLists = await SongPlaylistModel.findAll({
      where: {
        playlistId: idPlaylist,
      },
      include: [
        {
          model: SongModel,
          as: 'song',
        },
      ],
    });

    return response.status(200).json({
      data: PlayLists,
    });
  }
  //#endregion

  //#region get all
  async getAllPlaylist(req, response) {
    const userId = req.userId;
    const pageCurrent = Number(req.query.page);
    const perPage = Number(req.query.per_page);
    const sort = req.query.sort;

    const data = await playlistRepository.getPlaylists({
      page: pageCurrent,
      perPage: perPage,
      userId: userId,
      sort: sort,
    });
    return response.status(StatusCodes.OK).json({ count: data.length, data });
  }
  //#endregion

  //#region get playlist by id
  async getPlaylistById(req, response) {
    const idPlaylist = req.query.idPlaylist;
    const userId = req.userId || null;

    const playlist = await playlistRepository.getById(idPlaylist, userId);

    return response.status(200).json({
      data: playlist,
    });
  }
  //#endregion

  //#region get playlists of user
  async getPlaylistByUserId(req, response) {
    const queryId = Number(req.query.idUser);
    if (!queryId) throw new ValidationError({ idUser: 'Not validation' });
    const userId = req.userId || null;

    const user = await UserModel.findByPk(queryId, {
      attributes: {
        exclude: ['password', 'refreshToken'],
      },
    });
    if (user === null) throw new NotFoundError({ message: 'Not found user' });

    const playlists = await playlistRepository.getPlaylistsOfUser(queryId, userId);

    return response.status(200).json({
      data: {
        user: user,
        playlists: playlists,
      },
    });
  }
  //#endregion

  //#region delete playlist
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
  //#endregion

  //#region get my playlist
  async MyPlaylists(req, response) {
    const userId = req.userId;
    const data = await playlistRepository.getFollowingPlaylists(userId, userId);
    return response.status(StatusCodes.OK).json({ data });
  }
  //#endregion

  //#region get followers
  async getUserFollowPlaylist(req, response) {
    const playlistId = req.query.idPlaylist;
    if (!playlistId) throw NotFoundError({ playlistId: 'Must be filled' });
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
        data: Users,
      });
    } else {
      return response.status(422).json({
        result: false,
        data: [],
      });
    }
  }
  //#endregion

  //#region get random
  async getRandomPlaylist(req, response) {
    const quantity = Number(req.query.quantity);
    const userId = req.userId;
    if (!quantity) throw new ValidationError({ quantity: 'Not validation' });

    const playlists = await playlistRepository.getPlaylists({
      page: 1,
      perPage: quantity,
      random: true,
      userId,
    });
    return response.status(200).json({ data: playlists });
  }
  //#endregion
}

module.exports = new PlayListController();
