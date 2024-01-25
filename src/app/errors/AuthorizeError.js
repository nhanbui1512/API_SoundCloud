module.exports = class AuthorizeError extends Error {
  constructor(message) {
    super();
    this.status = 401;
    this.messageObject = message;
  }
};
