const { APIError } = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const { getUserPlan, getUserById, updateUserToken } = require("../services");
const { ACTIONS, ERROR_FIELD } = require("../utils/actions");
const config = require("../config/env");
const AccountModel = require("../models/account.model");

const adminRequired =async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    if(!token) token = req.headers?.authorization.split(" ")[1];
    if (!token) token = req.headers?.cookie?.split("=")[1];
    if (!token) return next(APIError.unauthenticated());
    const payload = jwt.verify(token, config.REFRESH_TOKEN_SECRETE);
    if (payload.type.toLowerCase() !== ACTIONS.ACCOUNT_TYPE[1])
      return next(APIError.unauthorized());
    req.userId = payload.id;
    req.userType = payload.type;
    //extend cookie
    const newPayload = {id:payload.id, type:payload.type};
     
    const newtoken = jwt.sign(newPayload, config.TOKEN_SECRETE, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(newPayload, config.REFRESH_TOKEN_SECRETE, {
      expiresIn: "60m",
    });
    
    await updateUserToken(payload.id,refreshToken, token);
    res.clearCookie("jwt", newtoken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      // maxAge: 60 * 60 * 1000,
    });
    res.cookie("jwt", refreshToken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      // maxAge: 60 * 60 * 1000,
    });
    next();
  } catch (error) {
    if (error.message === ERROR_FIELD.JWT_EXPIRED) next(APIError.unauthenticated());
    next(error);
  }
};
const userRequired = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    if(!token) token = req.headers?.authorization.split(" ")[1];
    if (!token) token = req.headers?.cookie?.split("=")[1];
    if (!token) return next(APIError.unauthenticated());
    const payload = jwt.verify(token, config.REFRESH_TOKEN_SECRETE);
    const isUser = await getUserById(payload.id);
    if (!isUser) return next(APIError.customError(`user does not exist`, 404));
    if (isUser.error) return next(APIError.customError(isUser.error),400);
    req.userId = payload.id;
    req.userType = payload.type;
    req.username = isUser.username;
    req.email = isUser.email;
    //extend cookie
    const newPayload = {};
    for (const key in payload) {
      if (key !== "exp" && key !== "iat") newPayload[key] = payload[key];
    }
    const newtoken = jwt.sign(newPayload, config.TOKEN_SECRETE , {
      expiresIn: "30m",
    });
    const newRefreshToken = jwt.sign(newPayload, config.REFRESH_TOKEN_SECRETE, {
      expiresIn: "60m",
    });
    const tokenArray = isUser.refreshToken.filter(rt => rt !==token);
    isUser.refreshToken =[...tokenArray, newRefreshToken];
    isUser.save();
    // await updateUserToken(payload.id,newRefreshToken,token);
    res.clearCookie("jwt", newRefreshToken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      // maxAge: 60 * 60 * 1000,
    });
    res.cookie("jwt", newRefreshToken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      // maxAge: 60 * 60 * 1000,
    });
    next();
  } catch (error) {
    if (error.message === ERROR_FIELD.JWT_EXPIRED) 
      next(APIError.unauthenticated());
    else next(error);
  }
};

const userPlanRequired = async (req, res, next) => {
  try {
    if (!req.userId) return next(APIError.unauthenticated());
    const user = await getUserPlan(req.userId);
    if (!user)
      return next(APIError.customError("User plan was not found", 404));
    if (user.error) return next(APIError.customError(user.error, 400));
    req.plan = user.plan;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminRequired,
  userRequired,
  userPlanRequired,
};
