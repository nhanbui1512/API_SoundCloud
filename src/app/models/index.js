const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require('sequelize');
const User = require('./userModel');
const Song = require('./songModel');
const PlayList = require('./playListModel');
const UserLikeSong = require('./UserLikeSong');

const { local, cloud } = require('../../config/mysql');
const Genre = require('./genreModel');
const FollowUser = require('./followUser');
const FollowPlaylist = require('./followPlaylist');
const SongPlaylist = require('./SongPlaylistModel');

dotenv.config();

const sequelize = new Sequelize(cloud.dbName, cloud.userName, cloud.password, cloud.config);

const UserModel = User(sequelize);
const SongModel = Song(sequelize);
const PlayListModel = PlayList(sequelize);
const GenreModel = Genre(sequelize);
const UserLikeSongModel = UserLikeSong(sequelize);
const FollowUserModel = FollowUser(sequelize);
const FollowPlaylistModel = FollowPlaylist(sequelize);
const SongPlaylistModel = SongPlaylist(sequelize);

// relationship

UserModel.hasMany(SongModel, { onDelete: 'CASCADE' }); // USER VS SONG
SongModel.belongsTo(UserModel, { onDelete: 'CASCADE' });

UserModel.belongsToMany(SongModel, { through: UserLikeSongModel }); // USER - USER_LIKE_SONG - ROOM
SongModel.belongsToMany(UserModel, { through: UserLikeSongModel });

FollowUserModel.belongsTo(UserModel, { as: 'follower', foreignKey: 'user_id' }); // USER FOLLOW USER
FollowUserModel.belongsTo(UserModel, { as: 'following', foreignKey: 'followed' });

UserModel.belongsToMany(PlayListModel, { through: FollowPlaylistModel }); // USER - FOLLOWPLAYLIST - PLAYLIST
PlayListModel.belongsToMany(UserModel, { through: FollowPlaylistModel });

SongModel.belongsToMany(PlayListModel, { through: SongPlaylistModel }); // SONG - SONG_PLAYLIST - PLAYLIST
PlayListModel.belongsTo(SongModel, { through: SongModel });

SongModel.belongsTo(GenreModel, { onDelete: 'CASCADE' }); // SONG - GENRE
GenreModel.hasMany(SongModel, { onDelete: 'CASCADE' });

UserModel.hasMany(PlayListModel, { onDelete: 'CASCADE' }); // USER - PLAYLIST
PlayListModel.belongsTo(UserModel, { onDelete: 'CASCADE' });

module.exports = {
  sequelize,
  UserModel: sequelize.models.users,
};
