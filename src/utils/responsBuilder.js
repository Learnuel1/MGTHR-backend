const buildUser = (userObj) => {
  const { _id, __v, password,refreshToken, ...data } = userObj;
  return data;
};
const buildEmployee = (empObj) => {
  const {createdAt, updatedAt,_id, __v, ...data}= empObj;
  return data;
}
const buildAccount = (userObj) => {
  const { _id, __v, password,refreshToken,employee, ...data } = userObj;
  data.employee = buildEmployee(employee);
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
  buildAccount,
};
