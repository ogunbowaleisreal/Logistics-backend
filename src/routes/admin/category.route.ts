import { Router } from "express";
import {
  createCategory,
  createDefaultCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../controllers/admin/category.controller";
import { adminVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("")
  .post(adminVerification, createCategory)
  .get(adminVerification, getCategories)
  .patch(adminVerification, updateCategory)
  .delete(adminVerification, deleteCategory);

router.post("/default", adminVerification, createDefaultCategory);

export default router;
