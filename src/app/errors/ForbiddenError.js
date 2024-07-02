module.exports = class ForbiddenError extends Error {
  constructor(message) {
    super();
    this.status = 403;
    this.messageObject = message;
  }
};
