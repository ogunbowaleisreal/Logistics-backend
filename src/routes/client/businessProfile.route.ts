import { Router } from "express";
import { getBusinessProfile } from "../../controllers/client/businessProfile.controller";

const router = Router();

router.get("/", getBusinessProfile);

export default router;
