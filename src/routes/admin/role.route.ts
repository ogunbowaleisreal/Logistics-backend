import { Router } from "express";
import {
  getRoles,
  createRole,
  updateRole,
  getPermissions,
} from "../../controllers/admin/role.controller";
import {
  adminVerification,
  roleVerification,
} from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("")
  .get(adminVerification, getRoles)
  .post(roleVerification("CRTROLE"), createRole)
  .patch(roleVerification("UPTROLES"), updateRole);

router.get("/permissions", adminVerification, getPermissions);

export default router;
