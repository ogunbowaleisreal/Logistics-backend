import { Router } from "express";
import adminRoute from "./admin.route";
import adminAuthRoute from "./authentication.route";
import roleRoute from "./role.route";
import categoryRoute from "./category.route";
import accountRoute from "./account.route";
import faqRoute from "./faq.route";
import bannerRoute from "./banner.route";
import notificationRoute from "./notification.route";
import subcategoryRoute from "./subcategory.route";
import bankRoute from "./bank.route";
import transactionRoute from "./transaction.route";
import colorRoute from "./color.route";
import configurationRoute from "./configuration.route";

const router = Router();

router.use("/", adminRoute);
router.use("/auth", adminAuthRoute);
router.use("/accounts", accountRoute);
router.use("/categories", categoryRoute);
router.use("/subcategories", subcategoryRoute);
router.use("/colors", colorRoute);
router.use("/roles", roleRoute);
router.use("/faq", faqRoute);
router.use("/banners", bannerRoute);
router.use("/notifications", notificationRoute);
router.use("/banks", bankRoute);
router.use("/transactions", transactionRoute);
router.use("/configuration", configurationRoute);

export default router;
