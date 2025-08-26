import { Router } from "express";
import accountRoute from "./account.route";
import authenticationRoute from "./authentication.route";
import categoryRoute from "./category.route";
import faqRoute from "./faq.route";
import bannerRoute from "./banner.route";
import notificationRoute from "./notification.route";
import bankRoute from "./bank.route";
import subcategoryRoute from "./subcategory.route";

const router = Router();

router.use("/auth", authenticationRoute);
router.use("/account", accountRoute);
router.use("/category", categoryRoute);
router.use("/subcategory", subcategoryRoute);
router.use("/notification", notificationRoute);
router.use("/faq", faqRoute);
router.use("/banner", bannerRoute);
router.use("/bank", bankRoute);

export default router;
