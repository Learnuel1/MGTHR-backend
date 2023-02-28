const express = require("express");
const Controllers = require("../controllers");
const { adminRequired, userRequired } = require("../middlewares/auth.middleware");
const userRoute = express.Router();

userRoute.post('/defalt-user', Controllers.UserController.defaultAccount);
userRoute.post('/create', adminRequired, Controllers.UserController.createAccount)
userRoute.get("/account", userRequired, Controllers.UserController.getAccount);
userRoute.get("/accounts", adminRequired, Controllers.UserController.getAccounts);
userRoute.post("/department", adminRequired, Controllers.UserController.assignDepartment);
userRoute.get("/department", adminRequired, Controllers.UserController.getDepartment);
userRoute.put("/account", userRequired, Controllers.UserController.updateAccount)
userRoute.post("/manager", adminRequired, Controllers.UserController.createManager)
module.exports = {
  userRoute,
}