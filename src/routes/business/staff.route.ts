import { Router } from "express";
import {
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
} from "../../controllers/business/staff.controller";
import {
  businessVerification,
  staffRoleVerification,
} from "../../middlewares/authorization.middleware";

const router = Router();

router.post("/", businessVerification, createStaff);
router.get("/", businessVerification, getStaff);
router.patch("/", businessVerification, updateStaff);
router.delete("/", businessVerification, deleteStaff);

export default router;
