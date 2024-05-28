const checkPass = (passWord) => {
  var regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,30}$/;
  pass = passWord.split(' ').join('');
  return regExp.test(pass);
};

module.exports = { checkPass };
