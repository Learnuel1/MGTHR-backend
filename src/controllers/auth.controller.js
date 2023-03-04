const config = require("../config/env");
const AccountModel = require("../models/account.model");
const { APIError } = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const { META, ERROR_FIELD } = require("../utils/actions");
const logger = require("../logger");
const responseBuilder = require("../utils/responsBuilder");
const { compareSync } = require("bcryptjs");

exports.login = async (req, res, next) => {
  try {
    let refreshToken = req.cookie?.jwt; 
    if(!refreshToken) refreshToken = req.headers.authorization?.split(" ")[1]; 
    if(!refreshToken) refreshToken = req.headers.cookie?.split(" ")[1]; 
    const {username, password } = req.body;
    if(!username) return next(APIError.badRequest("Username is required"));
    if(!password) return next(APIError.badRequest("Password is required"));
    const foundUser = await AccountModel.findOne({refreshToken}).exec();
    let newRefreshTokenArr =[];
    if(refreshToken){
    if(!foundUser){
      jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRETE,async (err, decoded) => {
        if(err) return next(APIError.customError(ERROR_FIELD.INVALID_TOKEN,403));
        const untrustedUser =await AccountModel.findOne({_id:decoded.id});
        untrustedUser.refreshToken = [];
        untrustedUser.save();
        logger.info("Token reuse detected", {meta:META.AUTH_SERVICE});   
      });
      logger.info("Hacked token verified successfully", {meta:META.AUTH_SERVICE});   
      return next(APIError.customError(ERROR_FIELD.INVALID_TOKEN,403));
    }
    if(refreshToken)
       newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
  }

  if(foundUser){
    jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRETE,async (err, _decoded) => {
      if(err) return next(APIError.customError(ERROR_FIELD.INVALID_TOKEN,403));
      logger.info("Relogin detected",{meta: META.AUTH_SERVICE})
      return next(APIError.customError("There is active session on this account, logout first",403));
      
    });
    return next(APIError.customError("There is active session on this account, logout first",403));
  }
  res.clearCookie("jwt", {httpOnly: true, sameSite:'None', secure:true});
    const user = await AccountModel.findOne({email:username}).exec();
    if(!user) return next(APIError.customError("Account doest not exist",400));
    const verify = compareSync(password,user.password);
    if(!verify) return next(APIError.customError("Incorrect password", 400));
    const payload = { id: user._id, role: user.role };
    const accessToken = jwt.sign(payload, config.TOKEN_SECRETE, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRETE, {
      expiresIn: "30m",
    });
    
    const data = responseBuilder.buildUser(user.toObject());
    user.refreshToken=[...newRefreshTokenArr, newRefreshToken];
    user.save();
    logger.info("Login successful", {meta:META.AUTH_SERVICE});
    const response = responseBuilder.commonReponse(
      "login successful",
      data,
      "user",
      { accessToken, refreshToken:newRefreshToken }
    );
    res.cookie("jwt", newRefreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: "none",
      // maxAge:24*60*60*1000
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};


exports.logout = async (req, res, next) => {
  try {
    let refreshToken = req.cookies?.jwt;
    if (!refreshToken) refreshToken = req.headers?.authorization?.split(" ")[1];
    if (!refreshToken) return next(APIError.unauthenticated());

    const user = await AccountModel.findOne({refreshToken}).exec();
    if(!user){
      res.clearCookie("jwt", {httpOnly: true, sameSite:'None', secure:true});
      return next(APIError.customError(`No active session found`, 404));
    }
    user.refreshToken = user.refreshToken.filter(rt => rt !== refreshToken);
    await user.save();
    res.clearCookie("jwt", {httpOnly: true, sameSite:'None', secure:true});
    res
      .status(200)
      .json({ success: true, msg: "You have successfully logged out" });
  } catch (error) {
    next(error);
  }
};


exports.handleRefreshToken = async (req, res, next) => {
  let refreshToken = req.cookie?.jwt;
  if(!refreshToken) refreshToken = req.headers.authorization?.split(" ")[1];
  if(!refreshToken) refreshToken = req.headers.authorization?.split("=")[1];
  if(!refreshToken) return next(APIError.unauthenticated());
  res.clearCookie("jwt",{httpOnly:true, sameSite: 'None', secure:true});
  const foundUser = await AccountModel.findOne({refreshToken}).exec();
  // Detected refresh toke reuse
  if(!foundUser){
    jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRETE, async (err, decoded) => {
      if(err) return next(APIError.customError(ERROR_FIELD.INVALID_TOKEN, 403));
      const usedToken =await AccountModel.findOne({_id:decoded.id}).exec();
      usedToken.refreshToken =[];
      usedToken.save();
    });
    logger.info("Token reuse detected", {meta: "refreshtoken-service"});
    return next(APIError.customError(ERROR_FIELD.INVALID_TOKEN,403));
  }
  const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
  //evaluate jwt
  jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRETE, async (err, decoded) => {
    if(err){
      foundUser.refreshToken =[...newRefreshTokenArr];
      foundUser.save();
    }
    if(err || foundUser._id.toString() !== decoded.id) return next(APIError.customError(ERROR_FIELD.JWT_EXPIRED,403));
    //Refresh token still valid
    const payload = {id:foundUser._id,type:foundUser.role};
    const token = jwt.sign(payload, config.TOKEN_SECRETE, {expiresIn:"15m"});
    const newRefreshToken = jwt.sign(payload,config.REFRESH_TOKEN_SECRETE,{expiresIn:"30m"});
    foundUser.refreshToken = [...newRefreshTokenArr,newRefreshToken];
    foundUser.save(); 
    res.cookie("jwt",newRefreshToken, {httpOnly:true, sameSite: 'None', secure:false});
    res.status(200).json({success:true, token, refreshToken:newRefreshToken});
  });
};