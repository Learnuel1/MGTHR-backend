/* eslint-disable no-undef */
require("dotenv").config();
const config = {
  DB_URI: process.env.DB_URI,
  SERVER_PORT: process.env.PORT,
  FRONTEND_ORIGIN_URL: process.env.FRONTEND_ORIGIN_URL,
  TOKEN_SECRETE: process.env.TOKEN_SECRETE,
  REFRESH_TOKEN_SECRETE: process.env.REFRESH_TOKEN_SECRETE,
  NODE_ENV: process.env.NODE_ENV,
  ERROR_LOG_URL: process.env.ERROR_LOG_URL,
};
module.exports = config;
