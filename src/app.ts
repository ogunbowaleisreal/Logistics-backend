import express, {
  Request,
  Response,
  json,
  urlencoded,
  Application,
  NextFunction,
} from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import databaseConnection from "./config/database";
import cacheConnection from "./config/cache";
import logger from "../logger/index";
import clientRoute from "./routes/client/index.route";
import adminRoute from "./routes/admin/index.route";
import businessRoute from "./routes/business/index.route";
import riderRoute from "./routes/rider/index.route";
import AppError from "./utilities/ErrorHandler";
import { v4 as uuidv4 } from "uuid";
import { startRiderResetJob } from "./jobs/RiderReset.Job";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.setupDB();
    this.setupCache();
    startRiderResetJob();
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
      logger.info("Database Connection Successful");
    } catch (error: any) {
      logger.error("Failed to connect to Database", error.message);
    }
  }

  private async setupCache() {
    try {
      await cacheConnection();
      logger.info("Redis Cache Connection Successful");
    } catch (error: any) {
      logger.error("Failed to connect to Cache", error.message);
    }
  }

  private setupRoutes(): void {
    this.app.get("/home", (req: Request, res: Response) => {
      res.send("Welcome to Logisticspadi API");
    });
    this.app.use("/api/client", clientRoute);
    this.app.use("/api/admin", adminRoute);
    this.app.use("/api/business", businessRoute);
    this.app.use("/api/rider", riderRoute);
    this.app.use(
      "/api/*",
      (req: Request, res: Response, next: NextFunction) => {
        throw new AppError(404, "Page not found");
      },
    );
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof AppError) {
          res.status(error.statusCode).json({
            message: error.message,
          });
        } else {
          logger.error(error.message, {
            error: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          });
          res.status(500).json({
            message: error.message,
          });
        }
      },
    );
  }
}

export default new App().app;
