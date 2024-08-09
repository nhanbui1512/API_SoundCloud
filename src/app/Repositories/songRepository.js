const { Op } = require('sequelize');
const { SongModel, sequelize, UserModel, GenreModel, UserLikeSongModel } = require('../models');
const { multiSqlizeToJSON } = require('../until/sequelize');
const NotFoundError = require('../errors/NotFoundError');

class SongRepository {
  constructor() {}

  //#region  getSongById
  async getSongById(songId, userId) {
    try {
      var song = await SongModel.findByPk(songId, {
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT COUNT(*) FROM userlikesongs WHERE songId = ${songId})`),
              'likeCount',
            ],
            [
              sequelize.literal(
                `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = ${songId}) THEN TRUE ELSE FALSE END AS result)`,
              ),
              'isLiked',
            ],
          ],
        },
        include: [
          {
            model: UserModel,
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_users WHERE user_id = user.id AND followed = ${userId}) THEN TRUE ELSE FALSE END AS result)`,
                  ),
                  'isFollowed',
                ],
                [
                  sequelize.literal(
                    `(SELECT COUNT (*) FROM follow_users WHERE followed = user.id)`,
                  ),
                  'followCount',
                ],
              ],
              exclude: ['refreshToken', 'password'],
            },
          },
          {
            model: GenreModel,
          },
        ],
      });
      if (song === null) return null;
      song = song.toJSON();

      song.owner = song.user;
      song.isLiked = song.isLiked === 1 ? true : false;
      song.nameGenre = song.genre.name;

      delete song.user;
      delete song.genre;
      return song;
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region  get Songs
  async getSongs({ page = 1, perPage = 10, userId = null, search, sort }) {
    const offset = (page - 1) * perPage;

    //#region  search
    var condition = {};
    if (search)
      condition = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          {
            artistName: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            description: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      };
    //#endregion

    try {
      var res = await SongModel.findAll({
        where: condition,
        include: [
          {
            model: UserModel,
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_users WHERE user_id = ${userId} AND followed = user.id) THEN TRUE ELSE FALSE END AS result)`,
                  ),
                  'isFollowed',
                ],
              ],
              exclude: ['password', 'refreshToken'],
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
          include: [
            [
              sequelize.literal(`(SELECT COUNT(*) FROM userlikesongs WHERE songId = songs.id)`),
              'likeCount',
            ],
            [
              sequelize.literal(
                `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = songs.id) THEN TRUE ELSE FALSE END AS result)`,
              ),
              'isLiked',
            ],
          ],
        },
        limit: Number(perPage),
        offset: offset,
        order: [['id', 'DESC']],
      });

      res = multiSqlizeToJSON(res);
      res.forEach((element) => {
        element.user.isFollowed = element.user.isFollowed === 1 ? true : false;
        element.isLiked = element.isLiked === 1 ? true : false;
        element.owner = element.user;

        delete element.user;
      });

      //#region sorting

      switch (sort) {
        case 'create_asc':
          res.sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
          break;
        case 'create_desc':
          res.sort((a, b) => new Date(a.createAt) - new Date(b.createAt));
          break;
        case 'name_asc':
          res.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          res.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'listen_asc':
          res.sort((a, b) => a.numberOfListen - b.numberOfListen);
          break;
        case 'listen_desc':
          res.sort((a, b) => b.numberOfListen - a.numberOfListen);
          break;
        case 'loop_asc':
          res.sort((a, b) => a.numberOfLoop - b.numberOfLoop);
          break;
        case 'loop_desc':
          res.sort((a, b) => b.numberOfLoop - a.numberOfLoop);
          break;
        default:
          break;
      }
      //#endregion

      return res;
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region Like Song
  async likeSong(songId, userId) {
    try {
      const user = await UserModel.findByPk(userId, {
        attributes: {
          exclude: ['refreshToken', 'password'],
        },
      });
      if (user === null) throw new NotFoundError({ message: 'Not found user' });
      const song = await SongModel.findByPk(songId);
      if (song === null) throw new NotFoundError({ message: 'Not found song' });

      const liked = await UserLikeSongModel.findOrCreate({
        where: {
          userId: userId,
          songId: songId,
        },
      });

      const result = liked[0].toJSON();

      result.user = user;
      result.song = song;
      return result;
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region createSong
  async createSong({ name, description, artistName, linkFile, thumbNail, duration, user, genre }) {
    try {
      const newSong = await SongModel.create({
        name: name,
        description: description,
        artistName: artistName,
        linkFile: linkFile,
        thumbNail: thumbNail,
        duration: duration,
      });

      if (user instanceof UserModel) await user.addSong(newSong);
      if (genre instanceof GenreModel) await genre.addSong(newSong);

      return newSong;
    } catch (error) {
      throw error;
    }
  }
  //#endregion
}
module.exports = new SongRepository();
