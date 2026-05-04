import { Router } from "express";
import {
  getBusinessTheme,
  getConfiguration,
} from "../../controllers/client/businessConfiguration.controller";

const router = Router();

router.get("", getConfiguration);

router.get("/theme", getBusinessTheme);

export default router;
