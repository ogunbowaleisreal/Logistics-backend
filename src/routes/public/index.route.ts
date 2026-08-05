import { Router } from "express";
import configurationRoute from "./configuration.route";
import faqRoute from "./faq.route";
import waitlistRoute from "./waitlist.route";
import orderRoute from "./order.route";
import whatsappRoutes from "./whatsappwebhook.routes"

const router = Router();

router.use("/configuration", configurationRoute);
router.use("/faq", faqRoute);
router.use("/waitlist", waitlistRoute);
router.use("/order", orderRoute);
router.use("/whatsapp", whatsappRoutes)

export default router;
