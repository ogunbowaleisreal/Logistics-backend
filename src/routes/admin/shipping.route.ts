import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import { getZones } from "../../controllers/admin/shipping.controller";

const router = Router();

router.route("/zones").get(adminVerification, getZones);

export default router;
