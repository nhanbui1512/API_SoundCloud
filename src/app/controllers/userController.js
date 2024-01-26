const { response } = require("express")
const {UserModel} = require("../models")
const { use } = require("../routes/userRoute")

class UserController {
  async registerUser(req, response, next) {
    const data = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      avatar: req.body.avatar || null,
    }

    if(!data.userName || !data.email || !data.password) {
      return response.status(422).json({
        result: false,
        message: 'The data is not filled'
      })
    }

    try {
      const user = await UserModel.findOne({
        where: {
          email: data.email
        }
      })

      if(user) {
        return response.status(400).json({
          result: false,
          message: 'Email is exist'
        })
      }
      else {
        const newUser = await UserModel.create(data)
        return response.status(200).json({
          result: true,
          data: newUser,
          message: 'Register successfully'
        })
      }
    } catch (error) {
      return response.status(500).json({message: error.message})
    }
  }

  async updateUser (req, response, next) {
    const userId = req.query.id
    
    if(userId) {
      const user = await UserModel.findOne({
        where: {
          id: userId
        }
      })

      user.userName = req.body.userName;
      user.email = req.body.email;
      user.password = req.body.password;
      user.avatar = req.body.avatar || null;

      const newUser = await user.save()
      return response.status(200).json({
        result: true,
        data: newUser,
        message: 'Update successfully'
      })
    }
    else {
      return response.status(400).json({
        result: false,
        message: 'User not found!'
      })
    }
  }

  async changePassWord (req, response, next) {
    const userId = req.query.id
    const ownPass = req.body.ownPassWord
    const newPass = req.body.newPassWord
    const confirmPass = req.body.confirmPassWord
    console.log(newPass, confirmPass, ownPass)
    if(!ownPass || !newPass || !confirmPass) {
      return response.status(400).json({
        result: false,
        message: 'Must be filled out completely'
      })
    }
    if(newPass != confirmPass) {
      return response.status(400).json({
        result: false,
        message: 'Pass new and comfirm is not alike'
      })
    }
    else {
      const user = await UserModel.findOne({
        where: {
          id: userId,
          password: ownPass
        }
      })
      if(user) {
        user.password = newPass
        const newUser = await user.save()
        return response.status(200).json({
          result: true,
          data: newUser,
          message: 'User was update pass successfully'
        })
      }
      else {
        return response.status(400).json({
          result: false,
          message: 'User not found'
        })
      }      
    }
  }
}

module.exports = new UserController();