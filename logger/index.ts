import developerLogger from "./developmentLogger";
import productionLogger from "./productionLogger";

let logger: any;

if (process.env.NODE_ENV === "development") {
  logger = developerLogger();
} else if (process.env.NODE_ENV === "production") {
  logger = productionLogger();
}

export default logger;
