import { NextFunction, Request, Response } from "express";
import { WaitlistService } from "../../services/admin/Waitlist.Service";

const waitlistService = new WaitlistService();

export const getWaitlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const waitlist = await waitlistService.getWaitlist(req.query);
    return res
      .status(200)
      .json({ message: "Waitlist fetched successfully", data: waitlist });
  } catch (error: any) {
    next(error);
  }
};
