import { Router } from "express";
import faqRoute from "./faq.route";
import bannerRoute from "./banner.route";
// import notificationRoute from "./notification.route";
import bankRoute from "./bank.route";
import orderRoute from "./order.route";
import configurationRoute from "./configuration.route";

const router = Router();

// router.use("/notification", notificationRoute);
router.use("/faq", faqRoute);
router.use("/banner", bannerRoute);
router.use("/bank", bankRoute);
router.use("/order", orderRoute);
router.use("/configuration", configurationRoute);

export default router;
