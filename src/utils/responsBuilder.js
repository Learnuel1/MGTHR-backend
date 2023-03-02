/* eslint-disable no-unused-vars */
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
  data.employee.Id=_id;
  return data;
};
const buildDepartment = (deptObj) => {
  const { _id, __v,...data } = deptObj;
  data.deptId = _id;
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
  buildDepartment,
};
