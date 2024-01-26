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

const sequelize = new Sequelize(local.dbName, local.userName, local.password, local.config);

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

// UserModel.belongsToMany(SongModel, { through: UserLikeSongModel }); // USER - USER_LIKE_SONG - ROOM
// SongModel.belongsToMany(UserModel, { through: UserLikeSongModel });
UserLikeSongModel.belongsTo(SongModel, { as: 'songOfUserLike', foreignKey: 'songId'});
UserLikeSongModel.belongsTo(UserModel, { as: 'user', foreignKey: 'userId'});


FollowUserModel.belongsTo(UserModel, { as: 'follower', foreignKey: 'user_id' }); // USER FOLLOW USER
FollowUserModel.belongsTo(UserModel, { as: 'following', foreignKey: 'followed' });

// UserModel.belongsToMany(PlayListModel, { through: FollowPlaylistModel }); // USER - FOLLOWPLAYLIST - PLAYLIST
// PlayListModel.belongsToMany(UserModel, { through: FollowPlaylistModel });
FollowPlaylistModel.belongsTo(UserModel, {as: 'followingUser', foreignKey: 'userId'})
FollowPlaylistModel.belongsTo(PlayListModel, {as: 'followingPlaylist', foreignKey: 'playlistId'})


// SongModel.belongsToMany(PlayListModel, { through: SongPlaylistModel }); // SONG - SONG_PLAYLIST - PLAYLIST
// PlayListModel.belongsTo(SongModel, { through: SongModel });
SongPlaylistModel.belongsTo(PlayListModel, { as: 'playlist', foreignKey: 'playlistId'} )
SongPlaylistModel.belongsTo(PlayListModel, { as: 'song', foreignKey: 'songId'} )

SongModel.belongsTo(GenreModel, { onDelete: 'CASCADE' }); // SONG - GENRE
GenreModel.hasMany(SongModel, { onDelete: 'CASCADE' });

UserModel.hasMany(PlayListModel, { onDelete: 'CASCADE' }); // USER - PLAYLIST
PlayListModel.belongsTo(UserModel, { onDelete: 'CASCADE' });

module.exports = {
  sequelize,
  UserModel: sequelize.models.users,
  GenreModel: sequelize.models.genres,
  SongModel: sequelize.models.songs,
  SongPlaylistModel: sequelize.models.song_playlist,
  PlayListModel: sequelize.models.playlists,
  FollowUser: sequelize.models.follow_users,
  FollowPlaylistModel: sequelize.models.follow_playlists,
  UserLikeSongModel: sequelize.models.userlikesongs,
};
