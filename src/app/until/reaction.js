const reactionFormater = (reactions) => {
  var result = {
    data: [],
  };

  for (var reaction of reactions) {
    var isExist = result.data.find((item) => item.title === reaction.emotion.name);
    if (!isExist) {
      result.data.push({
        emotionId: reaction.emotionId,
        title: reaction.emotion.name,
        users: [reaction.userUserId],
      });
    } else {
      result.data = result.data.map((emotion) => {
        if (emotion.title === reaction.emotion.name) {
          emotion.users.push(reaction.userUserId);
        }
        return emotion;
      });
    }
  }
  return result;
};

module.exports = {
  reactionFormater,
};
