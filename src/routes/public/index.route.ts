import { Router } from "express";
import configurationRoute from "./configuration.route";
import faqRoute from "./faq.route";
import waitlistRoute from "./waitlist.route";

const router = Router();

router.use("/configuration", configurationRoute);
router.use("/faq", faqRoute);
router.use("/waitlist", waitlistRoute);

export default router;
