require('dotenv').config();
function errorHandle(err, req, response, next) {
  const devEnvironment = process.env.dev.toLocaleLowerCase() === 'true';

  const messageError = err.messageObject || err.message;
  const statusError = err.status || 400;

  if (devEnvironment) {
    console.log('ERROR LOG: ', new Date().toLocaleDateString());
    console.log('ReqestL: ', req.method, req.originalUrl);
    console.log('Params: ', req.params);
    console.log('Body: ', req.body);
    console.log('Query: ', req.query);
    console.log('Error: ', err);
    // console.log('Error stack: ', err.stack);
    console.log(
      '--------------------------------------------------------------------------------------------------------------------------------------------',
    );
    console.log(messageError);
  }

  const error = {
    status: statusError,
    error: messageError,
  };

  return response.status(statusError).json(error);
}
module.exports = errorHandle;
