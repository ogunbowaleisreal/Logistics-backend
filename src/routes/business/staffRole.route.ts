import { Router } from "express";
import {
  getRoles,
  updateRole,
  getPermissions,
} from "../../controllers/business/staffRole.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router.get(
  "/permissions",
  staffRoleVerification("GETSTFROLES"),
  getPermissions,
);
router.get("/", staffRoleVerification("GETSTFROLES"), getRoles);
router.patch("/", staffRoleVerification("UPTSTFROLE"), updateRole);

export default router;
