const { where } = require('sequelize');
const { FollowUserModel, UserModel, UserLikeSongModel, SongModel } = require('../models');

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

        const userLikeSong = await SongModel.findAll({
            include: [
                {
                    model: UserModel,
                    as: 'user'
                }
            ]
        })

        return response.status(200).json({
            result: true,
            data: userLikeSong
        })
    }
}

module.exports = new Follower();
