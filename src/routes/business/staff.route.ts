import { Router } from "express";
import {
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
} from "../../controllers/business/staff.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router.post("/", staffRoleVerification("CRTSTAFF"), createStaff);
router.get("/", staffRoleVerification("GETSTAFF"), getStaff);
router.patch("/", staffRoleVerification("UPTSTAFF"), updateStaff);
router.delete("/", staffRoleVerification("DELSTAFF"), deleteStaff);

export default router;
