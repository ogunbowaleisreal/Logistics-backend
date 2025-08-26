import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createFAQCategory,
  getFAQCategories,
  updateFAQCategory,
  createFAQ,
  getFAQs,
  updateFAQ,
  deleteFAQ,
} from "../../controllers/admin/faq.controller";

const router = Router();

router
  .route("/categories")
  .post(adminVerification, createFAQCategory)
  .get(adminVerification, getFAQCategories)
  .patch(adminVerification, updateFAQCategory);

router
  .route("")
  .post(adminVerification, createFAQ)
  .get(adminVerification, getFAQs)
  .patch(adminVerification, updateFAQ)
  .delete(adminVerification, deleteFAQ);

export default router;
