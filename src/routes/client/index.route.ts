import { Router } from "express";
import faqRoute from "./faq.route";
import bannerRoute from "./banner.route";
// import notificationRoute from "./notification.route";
import bankRoute from "./bank.route";
import orderRoute from "./order.route";
import configurationRoute from "./configuration.route";
import shippingRoute from "./shipping.route";
import businessProfileRoute from "./businessProfile.route";
import privacyPolicyRoute from "./privacyPolicy.route";
import { businessContext } from "../../middlewares/authorization.middleware";
import termsAndConditionsRoute from "./termsAndConditions.route";

const router = Router();

router.use(businessContext);

// router.use("/notification", notificationRoute);
router.use("/faq", faqRoute);
router.use("/banner", bannerRoute);
router.use("/bank", bankRoute);
router.use("/order", orderRoute);
router.use("/configuration", configurationRoute);
router.use("/shipping", shippingRoute);
router.use("/business", businessProfileRoute);
router.use("/privacy-policy", privacyPolicyRoute);
router.use("/terms-and-conditions", termsAndConditionsRoute);

export default router;
