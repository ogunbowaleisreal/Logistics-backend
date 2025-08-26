import { Router } from "express";
import {
  createTheme,
  deleteTheme,
  getThemes,
  updateTheme,
} from "../../controllers/admin/theme.controller";
import { adminVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("")
  .post(adminVerification, createTheme)
  .get(adminVerification, getThemes)
  .patch(adminVerification, updateTheme)
  .delete(adminVerification, deleteTheme);

export default router;
