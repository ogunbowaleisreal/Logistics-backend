import { Router } from "express";
import {
  createTheme,
  deleteTheme,
  getThemes,
  updateTheme,
} from "../../controllers/business/theme.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .post(staffRoleVerification("CRTTHEME"), createTheme)
  .get(staffRoleVerification("GETTHEMES"), getThemes)
  .patch(staffRoleVerification("UPTTHEME"), updateTheme)
  .delete(staffRoleVerification("DELTHEME"), deleteTheme);

export default router;
