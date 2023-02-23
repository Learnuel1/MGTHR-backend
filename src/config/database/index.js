const { default: mongoose, connect } = require("mongoose");
const logger = require("../../logger");
const config = require("../env");

exports.connectMongoDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    logger.info("Connecting to Database...", {"meta":"database-service"});
    connect(config.DB_URI);
    logger.info("Database Connected Successfully",{"meta":"database-service"});
  } catch (e) {
    logger.error(e);
    process.exit(-1);
  }
};
