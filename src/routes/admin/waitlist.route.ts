import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { getWaitlistSchema } from "../../validators/waitlist.validator";
import { getWaitlist } from "../../controllers/admin/waitlist.controller";

const router = Router();

router.get("", adminVerification, validate(getWaitlistSchema, "query"), getWaitlist);

export default router;
