const config = require("./env");

exports.CONFIG = {
  APP_NAME: "HR Administration",
};

exports.CORS_WHITELISTS = [`localhost:${config.SERVER_PORT || 8001}`,` ${config.FRONTEND_ORIGIN_URL}`];

exports.CONSTANTS = {
  USER_TYPES: ["admin", "user","manager", "super"],
  USER_STATUS: ['inactive', 'active'],
};