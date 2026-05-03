import { Router } from "express";
import { getConfiguration } from "../../controllers/client/businessConfiguration.controller";

const router = Router();

router.get("", getConfiguration);

export default router;
