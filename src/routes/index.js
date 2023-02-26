const express = require("express");
const router = express.Router();
const AuthModule = require("./auth.route");
const UserModule = require("./user.route");

router.use("/auth", AuthModule.authRoute);
router.use("/user", UserModule.userRoute);

module.exports = router;