import express from "express";
import { riderVerification } from "../../middlewares/authorization.middleware";
import { getStats } from "../../controllers/rider/dashboard.controller";

const router = express.Router();

router.get("/stats", riderVerification, getStats);

export default router;
