const dotenv = require('dotenv');
const { local, cloud } = require('../../config/mysql');
dotenv.config();

const { Sequelize } = require('sequelize');
const User = require('./userModel');
const Song = require('./songModel');
const PlayList = require('./playListModel');
const UserLikeSong = require('./UserLikeSong');
const Role = require('./roleModel');

const Genre = require('./genreModel');
const FollowUser = require('./followUser');
const FollowPlaylist = require('./followPlaylist');
const SongPlaylist = require('./SongPlaylistModel');
const Comment = require('./commentModel');
const Notification = require('./notificationModel');
const NotiType = require('./notiTypeModel');

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
const RoleModel = Role(sequelize);
const CommentModel = Comment(sequelize);

const NotificationModel = Notification(sequelize);
const NotiTypeModel = NotiType(sequelize);

// relationship

RoleModel.hasMany(UserModel, { foreignKey: 'roleId', onDelete: 'CASCADE' });
UserModel.belongsTo(RoleModel, { foreignKey: 'roleId', onDelete: 'CASCADE' });

UserModel.hasMany(SongModel, { foreignKey: 'ownerId', onDelete: 'CASCADE' }); // USER VS SONG
SongModel.belongsTo(UserModel, { foreignKey: 'ownerId', onDelete: 'CASCADE' });

// USER - USER_LIKE_SONG - ROOM
UserLikeSongModel.belongsTo(SongModel, {
  as: 'songOfUserLike',
  foreignKey: 'songId',
  onDelete: 'CASCADE',
});
UserLikeSongModel.belongsTo(UserModel, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' });

FollowUserModel.belongsTo(UserModel, {
  as: 'follower',
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
}); // USER FOLLOW USER
FollowUserModel.belongsTo(UserModel, {
  as: 'following',
  foreignKey: 'followed',
  onDelete: 'CASCADE',
});

FollowPlaylistModel.belongsTo(UserModel, {
  as: 'followingUser',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
FollowPlaylistModel.belongsTo(PlayListModel, {
  as: 'followingPlaylist',
  foreignKey: 'playlistId',
  onDelete: 'CASCADE',
});

SongPlaylistModel.belongsTo(PlayListModel, {
  as: 'playlist',
  foreignKey: 'playlistId',
  onDelete: 'CASCADE',
});
SongPlaylistModel.belongsTo(SongModel, { as: 'song', foreignKey: 'songId', onDelete: 'CASCADE' });

SongModel.belongsTo(GenreModel, { onDelete: 'CASCADE' }); // SONG - GENRE
GenreModel.hasMany(SongModel, { onDelete: 'CASCADE' });

UserModel.hasMany(PlayListModel, { onDelete: 'CASCADE' }); // USER - PLAYLIST
PlayListModel.belongsTo(UserModel, { onDelete: 'CASCADE' });

// Quan hệ giữa Song và Comment
SongModel.hasMany(CommentModel, { foreignKey: 'songId', onDelete: 'CASCADE' });
CommentModel.belongsTo(SongModel, { foreignKey: 'songId', onDelete: 'CASCADE' });

// Quan hệ giữa Song và Comment
UserModel.hasMany(CommentModel, { foreignKey: 'userId', onDelete: 'CASCADE' });
CommentModel.belongsTo(UserModel, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Quan hệ self-referential của Comment
CommentModel.hasMany(CommentModel, { as: 'Replies', foreignKey: 'parentId' });
CommentModel.belongsTo(CommentModel, { as: 'Parent', foreignKey: 'parentId' });
NotiTypeModel.hasMany(NotificationModel, { onDelete: 'CASCADE' });
NotificationModel.belongsTo(NotiTypeModel, { onDelete: 'CASCADE' });

module.exports = {
  sequelize,
  UserModel: sequelize.models.users,
  GenreModel: sequelize.models.genres,
  SongModel: sequelize.models.songs,
  SongPlaylistModel: sequelize.models.song_playlist,
  PlayListModel: sequelize.models.playlists,
  FollowUserModel: sequelize.models.follow_users,
  FollowPlaylistModel: sequelize.models.follow_playlists,
  UserLikeSongModel: sequelize.models.userlikesongs,
  RoleModel: sequelize.models.roles,
  CommentModel: sequelize.models.comments,
  NotificationModel: sequelize.models.notifications,
  NotiTypeModel: sequelize.models.noti_types,
};
