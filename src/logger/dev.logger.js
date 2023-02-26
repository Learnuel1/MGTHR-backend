const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

const myFormat = printf(({ level, message, timestamp ,stack}) => {
  return `${timestamp} [${level}]   ${stack || message}`;
});


exports.devLogger = () => {
  return createLogger({
    level: "debug",
    format: combine(
      format.colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      myFormat
    ),
    // msg: "HTTP {{req.method}} {{req.url}}",
    // defaultMeta: { service: 'user-service' },
    transports: [new transports.Console()],
  });
};