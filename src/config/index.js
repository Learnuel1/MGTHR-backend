const config = require("./env");

exports.CONFIG = {
  APP_NAME: "HR Administration",
};

exports.CORS_WHITELISTS = [`localhost:${config.SERVER_PORT || 8001}`,` ${config.FRONTEND_ORIGIN_URL}`,`http://localhost:3000`, `http://localhost:5173`];

exports.CONSTANTS = {
  USER_TYPES: [ "user", "manager", "admin", "super"],
  USER_STATUS: ["inactive", "active"],
  USER_PASSWORD: ["Password123#", "TestPass1234"],
};