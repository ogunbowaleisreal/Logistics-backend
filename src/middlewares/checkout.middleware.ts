import { Request, Response, NextFunction } from "express";
import logger from "../../logger";

export const verifyFlutterwaveWebookHash = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const hashFromHeader = req.headers["verif-hash"] as string;

  if (!hashFromHeader || hashFromHeader !== secretHash) {
    logger.warn("Flutterwave webhook missing secret hash or header");
    return res
      .status(401)
      .json({ message: "Unauthorized - invalid signature" });
  }

  next();
};
