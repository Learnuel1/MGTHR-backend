const buildUser = (userObj) => {
  const { _id, __v, password,refreshToken, ...data } = userObj;
  return data;
};

const commonReponse = (msg, data, field = "data", others = {}, option = true) => {
  const response = {
    success: option,
    msg,
    [field]: data,
    ...others,
  };
  return response;
};

module.exports= {
  buildUser,
  commonReponse,
};
