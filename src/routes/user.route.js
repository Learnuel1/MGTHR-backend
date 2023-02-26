const express = require("express");
const Controllers = require("../controllers");
const { adminRequired } = require("../middlewares/auth.middleware");
const userRoute = express.Router();

userRoute.post('/defalt-user', Controllers.UserController.defaultAccount);
userRoute.post('/create', adminRequired, Controllers.UserController.createAccount)

module.exports = {
  userRoute,
}