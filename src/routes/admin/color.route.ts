import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import { createColor, deleteColor, getColors, updateColor } from "../../controllers/admin/color.controller";

const router = Router();

router
  .route("")
  .post(adminVerification, createColor)
  .get(adminVerification, getColors)
  .patch(adminVerification, updateColor)
  .delete(adminVerification, deleteColor);

export default router;
