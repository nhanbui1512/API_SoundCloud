const { shuffleArray } = require('../until/arrays');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const {
  PlayListModel,
  FollowPlaylistModel,
  UserModel,
  SongPlaylistModel,
  SongModel,
  sequelize,
  FollowUserModel,
} = require('../models');

const { createSongPlaylist } = require('../until/songPlaylist');
const { multiSqlizeToJSON } = require('../until/sequelize');
const playlistRepository = require('../Repositories/playlistRepository');
const { StatusCodes } = require('http-status-codes');

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

  async updatePlaylist(req, response) {
    const userId = req.userId;
    const playlistId = Number(req.query.playlistId);
    const name = req.query.name;

    const result = await playlistRepository.update(name, playlistId, userId);

    return response.status(200).json({ isSuccess: true, data: result });
  }

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

  async getAllPlaylist(req, response) {
    const errors = [];
    const userId = req.userId;
    const pageCurrent = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;

    if (perPage > 100) perPage = 100;

    if (!pageCurrent) errors.push({ pageCurrent: 'Page current not validation' });
    if (!perPage) errors.push({ perPage: 'per_page not validation' });
    if (errors.length > 0) throw new ValidationError(errors);

    const data = await playlistRepository.getPlaylists({
      page: pageCurrent,
      perPage: perPage,
      userId: userId,
    });
    return response.status(StatusCodes.OK).json({ count: data.length, data });
  }

  async getPlaylistById(req, response) {
    const idPlaylist = req.query.idPlaylist;
    const userId = req.userId || -1;

    var playlist = await PlayListModel.findOne({
      include: {
        model: UserModel,
        attributes: {
          exclude: 'password',
        },
      },
      where: {
        id: idPlaylist,
      },
    });

    if (playlist === null) throw new NotFoundError({ playlist: 'Not found' });
    // Lấy ra các bài hát của playlist
    var songs = await SongPlaylistModel.findAll({
      where: {
        playlistId: playlist.toJSON().id,
      },

      include: [
        {
          model: SongModel,
          as: 'song',
          attributes: {
            include: [
              [
                sequelize.literal(
                  `(SELECT  COUNT(*) FROM userlikesongs WHERE userlikesongs.songId = song.id)`,
                ),
                'likeCount',
              ],
              [
                sequelize.literal(
                  `(SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END AS result FROM userlikesongs  WHERE userlikesongs.userId = ${userId} AND userlikesongs.songId = song.id)`,
                ),
                'isLiked',
              ],
            ],
            exclude: ['ownerId'],
          },
          include: {
            model: UserModel,
            attributes: {
              exclude: 'password',
            },
          },
        },
      ],
    });

    songs = multiSqlizeToJSON(songs);
    playlist = playlist.toJSON();
    playlist.songs = [];
    songs.map((song) => {
      song.song.owner = song.song.user;
      song.song.isLiked = Boolean(song.song.isLiked);
      delete song.song.user;
      playlist.songs.push(song.song);
    });

    return response.status(200).json({
      data: playlist,
    });
  }

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

  // get follow-playlists
  async MyPlaylists(req, response) {
    const userId = req.userId;
    const data = await playlistRepository.getFollowingPlaylists(userId, userId);
    return response.status(StatusCodes.OK).json({ data });
  }

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

  async getRandomPlaylist(req, response) {
    const quantity = Number(req.query.quantity);
    const userId = req.userId || -1;
    if (!quantity) throw new ValidationError({ quantity: 'Not validation' });

    var playlists = await PlayListModel.findAll({
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END AS result FROM follow_playlists  WHERE follow_playlists.userId = ${userId} AND follow_playlists.playlistId = playlists.id)`,
              ),
              'isFollowed',
            ],
          ],
        },
        include: {
          model: UserModel,
          attributes: {
            include: [
              [
                sequelize.literal(
                  `(SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END AS result FROM follow_users  WHERE follow_users.user_id = ${userId} AND follow_users.followed = user.id)`,
                ),
                'isFollowed',
              ],
            ],
            exclude: 'password',
          },
        },
        limit: quantity,
        order: sequelize.random(),
      }),
      playlists = multiSqlizeToJSON(playlists);

    const playlistIds = playlists.map((playlist) => playlist.id);

    var songsOfPlaylist = await SongPlaylistModel.findAll({
        where: {
          playlistId: playlistIds,
        },
        include: [
          {
            model: SongModel,
            as: 'song',
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT  COUNT(*) FROM userlikesongs WHERE userlikesongs.songId = song.id)`,
                  ),
                  'likeCount',
                ],
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END AS result FROM userlikesongs  WHERE userlikesongs.userId = ${userId} AND userlikesongs.songId = song.id)`,
                  ),
                  'isLiked',
                ],
              ],
            },
            include: {
              model: UserModel,
              attributes: {
                exclude: 'password',
              },
            },
          },
        ],
      }),
      songsOfPlaylist = multiSqlizeToJSON(songsOfPlaylist);

    var ownerIds = songsOfPlaylist.map((item) => item.song.user.id);
    ownerIds = [...new Set(ownerIds)];

    var userFollowed = await FollowUserModel.findAll({
        where: {
          user_id: userId,
          followed: ownerIds,
        },
      }),
      userFollowed = multiSqlizeToJSON(userFollowed);

    songsOfPlaylist = songsOfPlaylist.map((item) => {
      item.song.isLiked = Boolean(item.song.isLiked);
      item.song.user.isFollowed = userFollowed.find(
        (follow) => follow.followed === item.song.user.id,
      )
        ? true
        : false;
      return item;
    });

    playlists.map((playlist) => {
      playlist.isFollowed = Boolean(playlist.isFollowed);
      playlist.owner = playlist.user;
      playlist.owner.isFollowed = Boolean(playlist.owner.isFollowed);
      delete playlist.user;
      var songs = songsOfPlaylist.filter((songPlaylist) => songPlaylist.playlistId === playlist.id);
      playlist.songs = songs.map((song) => song.song);
      playlist.countSong = songs.length;
    });

    return response.status(200).json({ data: playlists });
  }
}

module.exports = new PlayListController();
