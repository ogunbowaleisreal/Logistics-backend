import { Router } from "express";
import businessAuthRoute from "./authentication.route";
import staffAuthRoute from "./staffAuth.route";
import staffRoute from "./staff.route";
import staffRoleRoute from "./staffRole.route";
import orderRoute from "./order.route";
import riderRoute from "./rider.route";
import bankRoute from "./bank.route";
import bannerRoute from "./banner.route";
import faqRoute from "./faq.route";
import configurationRoute from "./configuration.route";
import themeRoute from "./theme.route";
import shippingRoute from "./shipping.route";

const router = Router();

router.use("/auth", businessAuthRoute);
router.use("/staff/auth", staffAuthRoute);
router.use("/staff", staffRoute);
router.use("/roles", staffRoleRoute);
router.use("/orders", orderRoute);
router.use("/riders", riderRoute);
router.use("/banks", bankRoute);
router.use("/banners", bannerRoute);
router.use("/faq", faqRoute);
router.use("/configuration", configurationRoute);
router.use("/themes", themeRoute);
router.use("/shipping", shippingRoute);

export default router;
