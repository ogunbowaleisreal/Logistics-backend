import mongoose from "mongoose";
import logger from "../../logger";

const databaseConnection = async () => {
  try {
    const mongodbURI = process.env["MONGODB_URI"]!;
    await mongoose.connect(mongodbURI, {});
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
};

export default databaseConnection;
