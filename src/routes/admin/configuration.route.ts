import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  getConfiguration,
  updateConfiguration,
} from "../../controllers/admin/configuration.controller";

const router = Router();

router
  .route("")
  .get(adminVerification, getConfiguration)
  .patch(adminVerification, updateConfiguration);

export default router;
