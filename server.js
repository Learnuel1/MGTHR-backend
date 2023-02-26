const app = require("./src/app");
const { dbConnect } = require("./src/config/db.config");
const logger = require("./src/logger");
const { errorMiddleWareModule } = require("./src/middlewares");
const config = require("./src/config/env");
const router = require('./src/routes')
app.use("/api/v1/", router);
const PORT = config.SERVER_PORT || 4000;
app.all("*", errorMiddleWareModule.notFound);
app.use(errorMiddleWareModule.errorHandler);
app.listen(PORT, async () => {
  try {
    await dbConnect.connectMongoDB();
    logger.info(`server running on port ${PORT}`,{meta:"application-service"});
  } catch (error) {
    logger.error(error,{meta:"application-service"});
    // eslint-disable-next-line no-undef
    process.exit(-1);
  }
});
