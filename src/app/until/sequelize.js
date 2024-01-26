module.exports = {
  multiSqlizeToJSON: function (data) {
    return data.map((element) => element.toJSON());
  },
  Sqlize: function (data) {
    return data ? data.toJSON() : data;
  },
};
