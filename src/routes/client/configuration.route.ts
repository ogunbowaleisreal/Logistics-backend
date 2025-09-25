import { Router } from "express";
import { getConfiguration } from "../../controllers/client/configuration.controller";

const router = Router();

router.get("", getConfiguration);

export default router;
