import { Router } from "express";
import {
  getRoles,
  updateRole,
  getPermissions,
} from "../../controllers/business/staffRole.controller";
import { businessVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router.get("/permissions", getPermissions);
router.get("/", businessVerification, getRoles);
router.patch("/", businessVerification, updateRole);

export default router;
