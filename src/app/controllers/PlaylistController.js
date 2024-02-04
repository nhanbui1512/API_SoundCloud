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

  async updatePlaylist(req, response) {
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
    // update playlist
    if (idSongs.length && idSongs.length > 0) {
      var songs = await SongModel.findAll({
          where: {
            id: idSongs,
          },
        }),
        songs = multiSqlizeToJSON(songs);
      var songIds = songs.map((song) => song.id);

      // kiểm tra xem song đã tồn tại trong play list
      var songsInPlaylist = await SongPlaylistModel.findAll({
          where: {
            playlistId: idPlaylist,
          },
        }),
        songsInPlaylist = multiSqlizeToJSON(songsInPlaylist);

      // xóa trong songIds nếu tồn tại trong check
      var songIdsInPlaylist = songsInPlaylist.map((songInPlaylist) => songInPlaylist.songId);
      if (songIdsInPlaylist.length < 1) {
        var songPlaylistIds = [];
        songIds.map((songId) => {
          songPlaylistIds.push({
            songId: songId,
            playlistId: Number(idPlaylist),
          });
        });
        await SongPlaylistModel.bulkCreate(songPlaylistIds);
      } else {
        var idSongs_update = [];
        var idSongs_delete = [];
        songIds.forEach((songId) => {
          if (!songIdsInPlaylist.includes(songId)) {
            idSongs_update.push(songId);
          }
        });

        songIdsInPlaylist.forEach((songId) => {
          if (!songIds.includes(songId)) {
            idSongs_delete.push(songId);
          }
        });

        var songPlaylistIds = [];
        idSongs_update.map((songId) => {
          songPlaylistIds.push({
            songId: songId,
            playlistId: Number(idPlaylist),
          });
        });
        await SongPlaylistModel.bulkCreate(songPlaylistIds);

        await SongPlaylistModel.destroy({
          where: {
            songId: idSongs_delete,
            playlistId: idPlaylist,
          },
        });
      }

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
    } else {
      return response.status(200).json({
        result: true,
        data: playList,
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
        result: false,
        message: 'Playlist not found',
      });
    }
  }

  async getPlaylistByUserId(req, response) {
    const queryId = Number(req.query.idUser);
    if (!queryId) throw new ValidationError({ idUser: 'Not validation' });
    const userId = req.userId || -1;

    const user = await UserModel.findByPk(queryId, {
      attributes: {
        exclude: 'password',
      },
    });
    if (user === null) throw new NotFoundError({ user: 'Not found' });

    var playLists = await PlayListModel.findAll({
        where: {
          userId: queryId,
        },
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT CASE WHEN COUNT(*) > 0 THEN 'true' ELSE 'false' END AS result FROM follow_playlists  WHERE follow_playlists.userId = ${userId} AND follow_playlists.playlistId = playlists.id)`,
              ),
              'isFollowed',
            ],
            [
              sequelize.literal(
                `(SELECT  COUNT(*) FROM follow_playlists WHERE follow_playlists.playlistId = playlists.id)`,
              ),
              'countFollow',
            ],
          ],
        },
      }),
      playLists = multiSqlizeToJSON(playLists);

    const playlistIds = playLists.map((playlist) => playlist.id);

    var songs = await SongPlaylistModel.findAll({
        where: {
          playlistId: playlistIds,
        },
        include: {
          model: SongModel,
          include: {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
          as: 'song',
          attributes: {
            include: [
              [
                sequelize.literal(
                  '(SELECT COUNT(*) FROM userlikesongs WHERE userlikesongs.songId = song.id)',
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
        },
      }),
      songs = multiSqlizeToJSON(songs);

    playLists.map((playlist) => {
      playlist.songs = songs.filter((song) => song.playlistId === playlist.id);
      return playlist;
    });

    playLists.map((playlist) => {
      playlist.songs = playlist.songs.map((song) => {
        delete song.id;
        delete song.createAt;
        delete song.updateAt;
        delete song.playlistId;
        delete song.songId;
        song.song.owner = song.song.user;
        delete song.song.user;
        song.song.isLiked = Boolean(song.song.isLiked);
        song = song.song;

        return song;
      });
      return playlist;
    });

    return response.status(200).json({
      data: {
        user: user,
        playlists: playLists,
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

      var playlistIds = playlists.map((playlist) => {
        return playlist.followingPlaylist.id;
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

      playlists = playlists.map((playlist) => {
        // add songs
        playlist.followingPlaylist.songs = [];
        playlist.followingPlaylist.isFollow = true;
        songs.map((song) => {
          if (playlist.followingPlaylist.id === song.playlistId) {
            playlist.followingPlaylist.songs.push(song.song);
          }
        });
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
