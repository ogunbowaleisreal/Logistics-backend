import { Router } from "express";
import { getContactInfo } from "../../controllers/public/configuration.controller";

const router = Router();

router.get("/contact", getContactInfo);

export default router;
