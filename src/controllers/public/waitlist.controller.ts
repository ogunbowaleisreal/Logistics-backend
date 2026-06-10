import { NextFunction, Request, Response } from "express";
import { WaitlistService } from "../../services/public/Waitlist.Service";

const waitlistService = new WaitlistService();

export const joinWaitlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const entry = await waitlistService.joinWaitlist(req.body);
    return res
      .status(201)
      .json({ message: "You have been added to the waitlist", data: entry });
  } catch (error: any) {
    next(error);
  }
};
