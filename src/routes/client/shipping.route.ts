import { Router } from "express";
import { getBusinessZones } from "../../controllers/client/shipping.controller";

const router = Router();

router.get("/zones", getBusinessZones);

export default router;
