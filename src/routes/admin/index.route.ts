import { Router } from "express";
import adminRoute from "./admin.route";
import adminAuthRoute from "./authentication.route";
import roleRoute from "./role.route";
import faqRoute from "./faq.route";
import bannerRoute from "./banner.route";
import bankRoute from "./bank.route";
import themeRoute from "./theme.route";
import riderRoute from "./rider.route";
import orderRoute from "./order.route";
import configurationRoute from "./configuration.route";
import businessRoute from "./business.route";

const router = Router();

router.use("/", adminRoute);
router.use("/auth", adminAuthRoute);
router.use("/roles", roleRoute);
router.use("/faq", faqRoute);
router.use("/banners", bannerRoute);
router.use("/banks", bankRoute);
router.use("/themes", themeRoute);
router.use("/riders", riderRoute);
router.use("/orders", orderRoute);
router.use("/configuration", configurationRoute);
router.use("/businesses", businessRoute);

export default router;
