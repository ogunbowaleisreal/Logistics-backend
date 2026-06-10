import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { joinWaitlistSchema } from "../../validators/waitlist.validator";
import { joinWaitlist } from "../../controllers/public/waitlist.controller";

const router = Router();

router.post("", validate(joinWaitlistSchema, "body"), joinWaitlist);

export default router;
