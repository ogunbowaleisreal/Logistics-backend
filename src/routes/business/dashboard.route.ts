import { Router } from "express";
import { businessVerification } from "../../middlewares/authorization.middleware";
import { getDashboardStats } from "../../controllers/business/dashboard.controller";

const router = Router();

router.get("/stats", businessVerification, getDashboardStats);

export default router;
