const mp3Duration = require('mp3-duration');
const {
  SongModel,
  UserModel,
  UserLikeSongModel,
  FollowUserModel,
  GenreModel,
  PlayListModel,
  SongPlaylistModel,
} = require('../models');

const ValidationError = require('../errors/ValidationError');
const NotfoundError = require('../errors/NotFoundError');
const { multiSqlizeToJSON, SqlizeToJSON } = require('../until/sequelize');
const { shuffleArray } = require('../until/arrays');
const { Op } = require('sequelize');

class SongController {
  async createSong(req, response) {
    const name = req.body.name;
    const description = req.body.description;
    const artistName = req.body.artistName;
    const genreId = Number(req.body.genreId);

    const errors = [];

    // fake iduser

    const userid = req.userId;

    if (!name) errors.push({ name: 'name must be attached' });
    if (!description) errors.push({ description: 'description must be attached' });
    if (!artistName) errors.push({ artistName: 'artistName must be attached' });
    if (!genreId) errors.push({ genreId: 'genreId is not validation' });

    if (errors.length > 0) throw new ValidationError(errors);
    if (!req.files.song)
      throw new ValidationError({
        song: 'file song must be attached',
      });

    if (!req.files.thumbNail)
      throw new ValidationError({
        thumbNail: 'file thumbnail must be attached',
      });

    const genre = await GenreModel.findByPk(genreId);
    if (genre === null) throw new NotfoundError({ genere: 'Not found' });

    const user = await UserModel.findByPk(userid);

    const song = req.files.song[0];
    const thumbNail = req.files.thumbNail[0];

    //Tính toán số giây của file nhạc
    mp3Duration(song.path, async function (err, duration) {
      if (err) {
        console.error(err.message);
        return;
      }

      const newSong = await SongModel.create({
        name: name,
        description: description,
        artistName: artistName,
        linkFile: song.filename,
        thumbNail: thumbNail.filename,
        duration: duration,
      });

      await user.addSong(newSong);
      await genre.addSong(newSong);
      return response.status(200).json({ isSuccess: true, data: newSong });
    });
  }

  // GET  /song/get-songs?page=2&per_page=12
  async getSongs(req, response) {
    const userId = req.userId || null;

    const currentPage = req.query.page || 1;
    var itemsPerPage = req.query.per_page || 10; // Số bản ghi trên mỗi trang
    if (itemsPerPage > 100) itemsPerPage = 100;

    const offset = (currentPage - 1) * itemsPerPage; // Tính OFFSET

    const page = Number(req.query.page);
    const perPage = Number(req.query.per_page);
    const erros = [];

    if (!page) erros.push({ page: 'page not validation' });
    if (!perPage) erros.push({ perPage: 'per_page not validation' });
    if (erros.length > 0) throw new ValidationError(erros);

    try {
      const songs = await SongModel.findAll({
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
          {
            model: GenreModel,
            attributes: {
              exclude: ['createAt', 'updateAt'],
            },
          },
        ],
        attributes: {
          exclude: ['genreId', 'ownerId'],
        },
        limit: Number(itemsPerPage),
        offset: offset,
        order: [['createAt', 'DESC']],
      });

      const ids = songs.map((song) => {
        return song.id;
      });

      var likes = await UserLikeSongModel.findAll({
        where: {
          songId: ids,
        },
        include: {
          model: UserModel,
          as: 'user',
        },
      });

      if (userId) {
        let result = songs.map((song) => {
          song = song.toJSON();

          song.owner = song.user;
          delete song.user;
          // Kiểm tra user có like bài hát hay không
          song.isLiked = likes.find((like) => like.userId === userId && song.id === like.songId)
            ? true
            : false;

          var count = likes.reduce((likeCount, like) => {
            if (like.songId == song.id) return likeCount + 1;
            else return likeCount;
          }, 0);

          song.likeCount = count;
          return song;
        });

        // Xáo trộn mảng
        result = shuffleArray(result);

        return response.status(200).json({ data: result });
      }

      let result = songs.map((song) => {
        song = song.toJSON();

        song.owner = song.user;
        delete song.user;

        var count = likes.reduce((likeCount, like) => {
          if (like.songId == song.id) return likeCount + 1;
          else return likeCount;
        }, 0);

        song.likeCount = count;
        return song;
      });
      // Xáo trộn mảng
      result = shuffleArray(result);

      return response.status(200).json({ data: result });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // GET     /song/getsong?song_id=12
  async getSongById(req, response) {
    const songId = req.query.song_id;
    if (!songId) throw ValidationError({ song_id: 'Must be attached' });
    const userId = req.userId || null;

    var song = await SongModel.findByPk(songId, {
      include: {
        model: UserModel,
        attributes: {
          exclude: ['password'],
        },
      },
    });

    song = SqlizeToJSON(song);
    song.owner = song.user;
    delete song.user;

    const likesOfThisSong = await UserLikeSongModel.findAll({
      where: {
        songId: songId,
      },
    });

    // nếu người dùng có gửi token lên (đã login)
    if (userId) {
      const isLiked = multiSqlizeToJSON(likesOfThisSong).find((item) => item.userId === userId);
      if (isLiked) song.isLiked = true;
    }

    song.likeCount = likesOfThisSong.length;

    return response.status(200).json({ song: song });
  }

  //  POST    /song/like?song_id =1
  async LikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });
    const song = await SongModel.findByPk(songId);

    if (song === null)
      throw new NotfoundError({
        song: 'Not found song',
      });

    const liked = await UserLikeSongModel.findOrCreate({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    const result = liked[0].toJSON();

    result.user = user;
    result.song = song;

    return response.send({
      data: result,
    });
  }

  async UnlikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    await UserLikeSongModel.destroy({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    return response.status(200).json({
      isSuccess: true,
      message: 'Unlike the song successfully',
    });
  }

  // DELETE /song
  async deleteSong(req, response) {
    const songId = Number(req.query.song_id);
    const userId = req.userId;

    if (!songId) throw new ValidationError({ song_id: 'Not validation' });

    const song = await SongModel.findOne({
      where: {
        ownerId: userId,
        id: songId,
      },
    });

    if (song === null) throw new NotfoundError({ song: 'User not own this song' });

    await song.destroy();
    return response.status(200).json({
      isSuccess: true,
      message: 'Delete song successfully',
    });
  }

  // GET /song/search?value=tenbaihat

  async SearchSong(req, response) {
    const value = req.query.value;
    if (!value || value.trim() === '') throw new ValidationError({ value: 'Not validation' });

    var songs = await SongModel.findAll({
        where: {
          name: { [Op.like]: `%${value}%` },
        },
        include: {
          model: UserModel,
          attributes: {
            exclude: ['password'],
          },
        },
      }),
      songs = multiSqlizeToJSON(songs);

    songs = songs.map((song) => {
      song.owner = song.user;
      delete song.user;
      return song;
    });

    var playlists = await PlayListModel.findAll({
        where: {
          name: { [Op.like]: [`%${value}%`] },
        },
      }),
      playlists = multiSqlizeToJSON(playlists);

    const playlistIds = playlists.map((playlist) => playlist.id);

    var songsOfPlaylist = await SongPlaylistModel.findAll({
      where: {
        playlistId: playlistIds,
      },
      include: {
        model: SongModel,
        as: 'song',
        // include: {
        //   model: UserModel,
        //   attributes: {
        //     exclude: ['password'],
        //   },
        // },
      },
    });

    songsOfPlaylist = multiSqlizeToJSON(songsOfPlaylist);

    songsOfPlaylist = songsOfPlaylist.map((song) => {
      var playlistId = song.playlistId;
      song = song.song;
      song.playlistId = playlistId;
      song.owner = song.user;
      delete song.user;
      return song;
    });

    playlists = playlists.map((playlist) => {
      playlist.songs = songsOfPlaylist.filter((song) => song.playlistId === playlist.id);

      return playlist;
    });

    return response.status(200).json({ songs, playlists });
  }
}

module.exports = new SongController();
