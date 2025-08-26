import { createLogger, transports, format } from "winston";
const { combine, timestamp, printf } = format;

const developmentFormat = printf(({ level, message, timestamp }) => {
  return `${level}: ${timestamp}: ${message}`;
});

const developmentLogger = () => {
  return createLogger({
    level: "debug",
    format: combine(timestamp(), developmentFormat),
    transports: [new transports.Console()],
  });
};

export default developmentLogger;
