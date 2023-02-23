
exports.CONFIG = {
  APP_NAME: "HR Administration",
};

exports.CORS_WHITELISTS = [`localhost:${process.env.PORT || 8001}`,` ${process.env.FRONTEND_ORIGIN_URL}`];
exports.CONSTANTS = {
  USER_TYPES: ["admin", "user","manager"],
  USR_STATUS: ['inactive', 'active'],
};