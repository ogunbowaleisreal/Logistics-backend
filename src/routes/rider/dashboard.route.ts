import { Router } from "express";
import { riderVerification } from "../../middlewares/authorization.middleware";
import { getStats } from "../../controllers/rider/dashboard.controller";

const router = Router();

router.get("/stats", riderVerification, getStats);

export default router;
