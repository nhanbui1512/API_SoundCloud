const { shuffleArray } = require('../until/arrays');
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
const { multiSqlizeToJSON } = require('../until/sequelize');

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
    const name = req.body.name;
    if (!idPlaylist) throw new ValidationError({ message: 'IdPlaylist must be attached' });
    if (!name) throw new ValidationError({ message: 'name must be attached' });

    const playList = await PlayListModel.findOne({
      where: {
        userId: userId,
        id: idPlaylist,
      },
    });

    if (playList === null) throw new NotFoundError({ playlist: 'Not found' });

    if (playList) {
      playList.name = name;
      await playList.save();
    }

    await createSongPlaylist(idSongs, idPlaylist); // add relationship song playlist

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

    if (PlayLists) {
      return response.status(200).json({
        result: true,
        data: PlayLists,
      });
    } else {
      return response.status(422).json({
        result: false,
        message: 'Playlist not found',
      });
    }
  }

  async removeSongsToPlaylist(req, response) {
    const userId = req.userId;
    const idPlaylist = req.query.idPlaylist;
    const idSongs = req.body.idSongs;
    if (!idPlaylist) throw new ValidationError({ message: 'IdPlaylist must be attached' });

    const playList = await PlayListModel.findOne({
      where: {
        userId: userId,
        id: idPlaylist,
      },
    });

    if (playList === null) throw new NotFoundError({ playlist: 'Not found' });

    await createSongPlaylist(idSongs, idPlaylist, 'delete'); // add relationship song playlist

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

    if (PlayLists) {
      return response.status(200).json({
        result: true,
        data: PlayLists,
      });
    } else {
      return response.status(422).json({
        result: false,
        message: 'Playlist not found',
      });
    }
  }

  async getAllPlaylist(req, response) {
    const errors = [];
    const userId = req.userId;
    const pageCurrent = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 10;

    if (per_page > 100) per_page = 100;
    const offset = (pageCurrent - 1) * per_page;
    if (!pageCurrent) errors.push({ pageCurrent: 'Page current not validation' });
    if (!per_page) errors.push({ per_page: 'per_page not validation' });
    if (errors.length > 0) throw new ValidationError(errors);

    try {
      const playlists = await PlayListModel.findAll({
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
        ],
        attributes: {
          exclude: ['userId'],
        },
        limit: per_page,
        offset: offset,
        order: [['createAt', 'DESC']],
      });

      const idPlaylists = playlists.map((playlist) => {
        return playlist.id;
      });

      const follows = await FollowPlaylistModel.findAll({
        where: {
          playlistId: idPlaylists,
        },
        include: [
          {
            model: UserModel,
            as: 'followingUser',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
      });

      if (userId) {
        // Lấy ra các bài hát có trong playlist
        var songs = await SongPlaylistModel.findAll({
          where: {
            playlistId: idPlaylists,
          },
          include: [
            {
              model: SongModel,
              as: 'song',
            },
          ],
        });
        songs = multiSqlizeToJSON(songs);

        var playlistSongs = playlists.map((playlist) => {
          playlist = playlist.toJSON();

          playlist.songs = [];
          songs.map((song) => {
            playlist.songs.push(song.song);
          });
          return playlist;
        });

        var result = playlistSongs.map((playlist) => {
          playlist.owner = playlist.user;
          delete playlist.user;

          // kiểm tra user có follow playlist hay không

          playlist.isFollowed = follows.find(
            (follow) => follow.userId === userId && playlist.id === follow.playlistId,
          )
            ? true
            : false;

          var count = follows.reduce((followCount, follow) => {
            if (follow.playlistId === playlist.id) return followCount + 1;
            else return followCount;
          }, 0);

          playlist.followCount = count;
          return playlist;
        });

        // Xáo trộn mảng
        result = shuffleArray(result);

        return response.status(200).json({ data: result });
      }

      var result = playlistSongs.map((playlist) => {
        playlist.owner = playlist.user;
        delete playlist.user;

        var count = follows.reduce((followCount, follow) => {
          if (follow.playlistId === playlist.id) return followCount + 1;
          else return followCount;
        }, 0);

        playlist.followCount = count;
        return playlist;
      });
      // Xáo trộn mảng
      result = shuffleArray(result);

      return response.status(200).json({ data: result });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPlaylistById(req, response) {
    const idPlaylist = req.query.idPlaylist;

    var playlist = await PlayListModel.findOne({
      where: {
        id: idPlaylist,
      },
    });
    // Lấy ra các bài hát của playlist
    var songs = await SongPlaylistModel.findAll({
      where: {
        playlistId: playlist.toJSON().id,
      },
      include: [
        {
          model: SongModel,
          as: 'song',
        },
      ],
    });

    songs = multiSqlizeToJSON(songs);
    playlist = playlist.toJSON();
    playlist.songs = [];
    songs.map((song) => {
      playlist.songs.push(song.song);
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

  async getPlaylistByUserId(req, response) {
    const userId = req.userId;

    var playlists = await PlayListModel.findAll({
      where: {
        userId: userId,
      },
    });
    playlists = multiSqlizeToJSON(playlists);
    var playlistIds = playlists.map((playlist) => {
      return playlist.id;
    });

    // Lấy ra các bài hát của playlist
    var songs = await SongPlaylistModel.findAll({
      where: {
        playlistId: playlistIds,
      },
      attributes: {
        exclude: ['songId'],
      },
      include: [
        {
          model: SongModel,
          as: 'song',
        },
      ],
    });

    songs = multiSqlizeToJSON(songs);

    playlists.map((playlist) => {
      playlist.songs = [];
      songs.map((song) => {
        if (playlist.id === song.playlistId) {
          playlist.songs.push(song.song);
        }
      });
    });

    return response.status(200).json({
      result: true,
      data: playlists,
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
      var playlists = multiSqlizeToJSON(playlistFollow);
      playlists = playlists.map((playlist) => {
        playlist.followingPlaylist.isFollow = true;
        return playlist.followingPlaylist;
      });
      return response.status(200).json({
        result: true,
        data: playlists,
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
