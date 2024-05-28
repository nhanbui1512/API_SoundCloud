module.exports = class ConfligError extends Error {
  constructor(message) {
    super();
    this.status = 409;
    this.messageObject = message;
  }
};
