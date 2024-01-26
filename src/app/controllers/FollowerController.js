const { where } = require('sequelize')
const { FollowUser, UserModel, UserLikeSongModel, SongModel } = require('../models')

class Follower {
    
    async getMyFollowers(req, response, next) {
        // const userId = req.userId

        // const userFollowers = await FollowUser.findAll(
        //     {
        //         where: {
        //             user_id: userId
        //         },
        //         include: {
        //             model: UserModel,
        //             as: 'following',
        //             attributes: {
        //                 exclude: ['password']
        //             }
        //         }
        //     }
        // )
        // const songUserLikes = []
        
        const songs = await SongModel.findAll({
            include: [
                {
                    model: UserModel,
                    as: 'user'
                }
            ]
        })
        const songsUser = songs.map(async (song) => {
            console.log(song.toJSON())
            const userLikeSongs = await UserLikeSongModel.findAll({
                where: {
                    songId: song.dataValues.id
                },
                include: [
                    {
                        model: UserModel,
                        as: 'user'
                    }
                ]
            })
            const userLike = userLikeSongs.map(async (userLikeSong) => {
                return song = {
                    ...song.toJSON(),
                    ...userLikeSong.toJSON()
                }
            })
            console.log(userLike)
            return userLike  
        })

        return response.status(200).json({
            result: true,
            data: songsUser
        })
        
    }
}

module.exports = new Follower()
