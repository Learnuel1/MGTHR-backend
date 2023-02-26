const { createLogger, format, transports } = require("winston");
const config = require("../config/env");
require("winston-mongodb");
const { combine, timestamp, errors, json , metadata} = format;

exports.proLogger = () => {
  return createLogger({
    format: combine(
      json(),
      timestamp(), 
      errors({ stack: true }),
      metadata()),
    // defaultMeta: { service: "user-service" },
    transports: [
      new transports.MongoDB({
        level: "error",
        collection: "hr_error_log",
        db: config.ERROR_LOG_URL,
        options: { useUnifiedTopology: true },
      }),
      new transports.MongoDB({
        level: "info",
        collection: "hr_infor_log",
        db: config.ERROR_LOG_URL,
        options: { useUnifiedTopology: true },
      }),
      new transports.MongoDB({
        level: "debug",
        collection: "hr_exception_log",
        db: config.ERROR_LOG_URL,
        options: { useUnifiedTopology: true },
      }),
    ],
  });
};
