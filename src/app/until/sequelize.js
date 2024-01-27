module.exports = {
  multiSqlizeToJSON: function (data) {
    return data.map((element) => element.toJSON());
  },
  SqlizeToJSON: function (data) {
    return data ? data.toJSON() : data;
  },
};
