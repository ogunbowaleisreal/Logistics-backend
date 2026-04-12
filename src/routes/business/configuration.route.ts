import express from "express";
import {
  getConfiguration,
  updateConfiguration,
} from "../../controllers/business/configuration.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router
  .route("/")
  .get(staffRoleVerification("GETCFG"), getConfiguration)
  .put(staffRoleVerification("UPTCFG"), updateConfiguration);

export default router;
