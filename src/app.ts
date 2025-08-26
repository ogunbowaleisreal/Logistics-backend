import express, {
  Request,
  Response,
  json,
  urlencoded,
  Application,
} from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import databaseConnection from "./config/database";
import cacheConnection from "./config/cache";
import logger from "../logger/index";
import clientRoute from "./routes/client/index.route";
import adminRoute from "./routes/admin/index.route";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.setupDB();
    this.setupCache();
    this.setupRoutes();
  }

  private config(): void {
    this.app.use(morgan("dev"));
    this.app.use(json({ limit: "5mb" }));
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(urlencoded({ extended: true, limit: "5mb" }));
  }

  private async setupDB() {
    try {
      await databaseConnection();
      logger.info("Databasae Connection Successful");
    } catch (error: any) {
      logger.error("Failed to connect to Database", error.messaage);
    }
  }

  private async setupCache() {
    try {
      await cacheConnection();
      logger.info("Redis Cache Connection Successful");
    } catch (error: any) {
      logger.error("Failed to connect to Cache", error.messaage);
    }
  }

  private setupRoutes(): void {
    this.app.get("/home", (req: Request, res: Response) => {
      res.send("Welcome to SME Logistics API");
    });
    this.app.use("/api/client", clientRoute);
    this.app.use("/api/admin", adminRoute);
  }
}

export default new App().app;
