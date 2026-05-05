import { Router } from "express";
import authenticationRoute from "./authentication.route";
import dashboardRoute from "./dashboard.route";
import orderRoute from "./order.route";

const router = Router();

router.use("/auth", authenticationRoute);
router.use("/dashboard", dashboardRoute);
router.use("/orders", orderRoute);

export default router;
