const { CommentModel } = require('../models');

class CommentController {
  async getComments(req, response) {
    response.send('get comments');
  }
  async createComment(req, response) {}
}
module.exports = new CommentController();
