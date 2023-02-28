const { APIError } = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const { ERROR_FIELD } = require("../utils/actions");
const config = require("../config/env");
const AccountModel = require("../models/account.model");
const { CONSTANTS } = require("../config");

const adminRequired =async (req, res, next) => {
  try {
    let refreshToken = req.cookies?.jwt;
    if(!refreshToken) refreshToken = req.headers?.authorization?.split(" ")[1];
    if (!refreshToken) refreshToken = req.headers?.cookie?.split("=")[1];
    if (!refreshToken) return next(APIError.unauthenticated());
      jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRETE, (err, decoded) => {
        if(err) return next(APIError.unauthenticated());
      });
    const isUser = await AccountModel.findOne({refreshToken})
    if (!isUser) return next(APIError.unauthenticated());
    if (isUser.role.toLowerCase() !== CONSTANTS.USER_TYPES[2] && isUser.role.toLowerCase() !== CONSTANTS.USER_TYPES[3]) return next(APIError.unauthorized());
    req.userId = isUser._id;
    req.userRole = isUser.role;
    next();
  } catch (error) {
    next(error);
  }
};
const userRequired = async (req, res, next) => {
  try {
    let refreshToken = req.cookies?.jwt;
    if(!refreshToken) refreshToken = req.headers?.authorization.split(" ")[1];
    if (!refreshToken) refreshToken = req.headers?.cookie?.split("=")[1];
    if (!refreshToken) return next(APIError.unauthenticated());
    jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRETE, (err, decoded) => {
      if(err) return next(APIError.unauthenticated());
    });
    const isUser = await AccountModel.findOne({refreshToken})
    if (!isUser) return next(APIError.unauthenticated());
    req.userId = isUser.id;
    req.userRole = isUser.role;
    next();
  } catch (error) {
      next(error);
  }
};

module.exports = {
  adminRequired,
  userRequired,
};
