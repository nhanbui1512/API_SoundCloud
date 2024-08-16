const mp3Duration = require('mp3-duration');
const {
  SongModel,
  UserModel,
  UserLikeSongModel,
  FollowUserModel,
  GenreModel,
} = require('../models');

const cloudinary = require('cloudinary').v2;

const ValidationError = require('../errors/ValidationError');
const NotfoundError = require('../errors/NotFoundError');
const { multiSqlizeToJSON } = require('../until/sequelize');
const { shuffleArray } = require('../until/arrays');
const { Op } = require('sequelize');
const { DeleteFile } = require('../until/manageFile');
const songRepository = require('../Repositories/songRepository');
const NotFoundError = require('../errors/NotFoundError');
const playlistRepository = require('../Repositories/playlistRepository');

class SongController {
  // Tạo nhạc
  //#region  create song
  async createSong(req, response) {
    const name = req.body.name;
    const description = req.body.description;
    const artistName = req.body.artistName;
    const genreId = Number(req.body.genreId);

    const errors = [];

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
    if (user === null) throw new NotfoundError({ message: 'Not found user' });

    const song = req.files.song[0];
    const thumbNail = req.files.thumbNail[0];

    //Tính toán số giây của file nhạc

    mp3Duration(song.path, async function (err, duration) {
      if (err) {
        console.error(err.message);
        return response.status(400).json({
          isSuccess: false,
          message: 'Create Song fail',
        });
      }
      if (duration < 60) {
        return response.status(400).json({ isSuccess: false, message: 'Audio file is too short' });
      }

      const uploadOptions = {
        transformation: {
          width: 400, // Chiều rộng mới
          height: 400, // Chiều cao mới
          crop: 'fill', // Phương pháp cắt ảnh
          format: 'jpg', // Định dạng mới
        },
        folder: 'images', // Thư mục trên Cloudinary để lưu ảnh
        resource_type: 'auto',
      };
      const imageUploaded = await cloudinary.uploader.upload(thumbNail.path, uploadOptions);

      const songUploaded = await cloudinary.uploader.upload(song.path, {
        folder: 'audios', // Tên thư mục bạn muốn sử dụng
        resource_type: 'auto',
      });

      try {
        const newSong = await songRepository.createSong({
          name,
          description,
          artistName,
          duration,
          linkFile: songUploaded.url,
          thumbNail: imageUploaded.url,
          user: user,
          genre: genre,
        });

        await DeleteFile(song.path);
        await DeleteFile(thumbNail.path);

        return response.status(200).json({ isSuccess: true, data: newSong });
      } catch (error) {
        throw error;
      }
    });
  }
  //#endregion

  // GET  /song/get-songs?page=2&per_page=12
  //#region  get songs
  async getSongs(req, response) {
    const userId = req.userId || null;
    var page = req.query.page || 1;
    var itemsPerPage = req.query.per_page || 10; // Số bản ghi trên mỗi trang
    if (itemsPerPage > 100) itemsPerPage = 100;

    const sort = req.query.sort;
    const search = req.query.search;

    var songs = await songRepository.getSongs({
      page,
      userId,
      sort,
      search,
      perPage: itemsPerPage,
    });
    if (req.query.suffle?.toLowerCase() === 'true') {
      songs = shuffleArray(songs);
    }

    return response.status(200).json({ data: songs });
  }
  //#endregion

  // GET     /song/getsong?song_id=12
  //#region get song by id
  async getSongById(req, response) {
    const songId = req.query.song_id;
    if (!songId) throw ValidationError({ song_id: 'Must be attached' });
    const userId = req.userId || null;

    const song = await songRepository.getSongById(songId, userId);
    if (song == null) throw new NotFoundError({ message: 'Not found song' });
    return response.status(200).json({ song: song });
  }
  //#endregion

  //  POST    /song/like?song_id =1
  //#region like song
  async LikeSong(req, response) {
    const userId = req.userId;
    const songId = Number(req.query.song_id);

    var result = await songRepository.likeSong(songId, userId);
    return response.send({
      data: result,
    });
  }
  //#endregion

  //#region unlike song
  async UnlikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    await songRepository.unlikeSong(songId, userId);

    return response.status(200).json({
      isSuccess: true,
      message: 'Unlike the song successfully',
    });
  }
  //#endregion

  // DELETE /song
  //#region delete song
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

    const link = song.linkFile;
    const startIndex = link.lastIndexOf('audios');
    const publicId = link.substring(startIndex, link.length - 4); // length -4 to delete .mp3

    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    await song.destroy();
    return response.status(200).json({
      isSuccess: true,
      message: 'Delete song successfully',
    });
  }
  //#endregion

  // GET /song/search?value=tenbaihat
  //#region search song
  async SearchSong(req, response) {
    const value = req.query.search_value;
    const userId = req.userId || null;
    var page = req.query.page || 1;
    var perPage = req.query.per_page || 10;
    const sort = req.query.sort;

    page = Number(page);
    perPage = Number(perPage);

    const songs = await songRepository.getSongs({ page, perPage, userId, sort, search: value });

    var playlists = await playlistRepository.getPlaylists({
      page,
      perPage,
      userId,
      sort,
      search: value,
    });

    return response.status(200).json({ songs, playlists });
  }
  //#endregion

  // Recomend những bài hát chưa được Like (req,response)
  //#region recommend songs
  async RecommendSongs(req, response) {
    const userId = req.userId;

    var songs = await SongModel.findAll({
        order: [
          ['numberOfListen', 'DESC'],
          ['createAt', 'DESC'],
        ],
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
          {
            model: GenreModel,
          },
        ],
        limit: 20,
      }),
      songs = multiSqlizeToJSON(songs);

    const ownerIds = songs.map((song) => song.user.id);

    var followed = []; // những người sở hữu bài hát mà được user follow
    if (userId) {
      followed = await FollowUserModel.findAll({
        where: {
          followed: ownerIds,
          user_id: userId,
        },
      });
      followed = multiSqlizeToJSON(followed);
    }

    if (!userId) {
      songs = songs.map((song) => {
        song.isLiked = false;
        song.owner = song.user;
        song.owner.isFollowed = false;
        delete song.user;

        return song;
      });

      return response.status(200).json({ data: songs });
    }

    const songIds = songs.map((song) => song.id);

    var userLikedSong = await UserLikeSongModel.findAll({
        where: {
          songId: songIds,
          userId: userId,
        },
      }),
      userLikedSong = multiSqlizeToJSON(userLikedSong);

    songs = songs.map((song) => {
      song.isLiked = userLikedSong.find((liked) => liked.songId === song.id) ? true : false;
      song.owner = song.user;
      delete song.user;

      song.owner.isFollowed = followed.find((follow) => follow.followed === song.owner.id)
        ? true
        : false;
      return song;
    });

    return response.status(200).json({ data: songs });
  }
  //#endregion

  //#region get liked songs
  async getSongsLiked(req, response) {
    var page = req.query.page || 1;
    var perPage = req.query.per_page || 15;
    const userId = req.userId || null;
    page = Number(page);
    perPage = Number(perPage);

    var targetUserId = req.query.user_id || userId;

    if (userId === null && targetUserId === null)
      throw new ValidationError({ message: 'Must provide your accessToken or user_id' });

    const songs = await songRepository.getLikedSongs({
      targetUserId,
      userId,
      page,
      perPage,
    });

    return response.status(200).json({ data: songs });
  }
  //#endregion
}

module.exports = new SongController();
