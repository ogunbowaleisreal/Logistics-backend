import { Router } from "express";

import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
} from "../../controllers/admin/subcategory.controller";

const router = Router();

router
  .route("")
  .post(adminVerification, createSubcategory)
  .get(adminVerification, getSubcategories)
  .patch(adminVerification, updateSubcategory)
  .delete(adminVerification, deleteSubcategory);

export default router;
