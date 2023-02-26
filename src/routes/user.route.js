const express = require("express");
const Controllers = require("../controllers")
const userRoute = express.Router();

userRoute.post('/defalt-user', Controllers.UserController.defaultAccount);


module.exports = {
  userRoute,
}