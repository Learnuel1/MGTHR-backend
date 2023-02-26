const express = require("express");
const Controllers = require("../controllers")
const authRoute = express.Router();

authRoute.post('/default-user', Controllers.UserController.defaultAccount);
authRoute.post("/login", Controllers.AuthController.login);
authRoute.post("/logout", Controllers.AuthController.logout);
authRoute.post("/refreshtoken", Controllers.AuthController.handleRefreshToken);

module.exports = {
  authRoute,
}