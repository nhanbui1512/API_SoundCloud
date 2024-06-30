const expresss = require('express');
const CommentController = require('../controllers/CommentController');
const isLoginMiddleWare = require('../middlewares/isLoginMiddleware');
const { createCommentValidation } = require('../Validations/commentValidation');
const router = expresss.Router();

router.get('/', CommentController.getComments);
router.post('/', isLoginMiddleWare, createCommentValidation, CommentController.createComment);

module.exports = router;
