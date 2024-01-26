const express = require('express');
const UserController = require('../controllers/userController')
const router = express.Router();

router.post('/register', UserController.registerUser);
router.put('/update', UserController.updateUser);
router.put('/change-password', UserController.changePassWord);

module.exports = router;
