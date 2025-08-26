import { createLogger, transports, format } from "winston";
const { combine, timestamp, printf } = format;

const defaultFormat = printf(({ level, message, timestamp }) => {
  return `${level}: ${timestamp}: ${message}`;
});

const productionLogger = () => {
  return createLogger({
    level: "info",
    format: combine(timestamp(), defaultFormat),
    transports: [new transports.Console()],
  });
};

export default productionLogger;
