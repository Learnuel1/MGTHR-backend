const express = require("express");
const Controllers = require("../controllers");
const { adminRequired } = require("../middlewares/auth.middleware");
const authRoute = express.Router();

authRoute.post('/default-user', Controllers.UserController.defaultAccount);
authRoute.post("/login", Controllers.AuthController.login);
authRoute.post("/logout", Controllers.AuthController.logout);
authRoute.post("/refreshtoken", Controllers.AuthController.handleRefreshToken);
authRoute.post("/department", adminRequired, Controllers.UserController.createDepartment);
authRoute.patch("/department", adminRequired, Controllers.UserController.updateDepartment);
authRoute.get("/department", adminRequired, Controllers.UserController.getDepartment);
authRoute.get("/accounts", adminRequired, Controllers.UserController.getAccounts);
module.exports = {
  authRoute,
}