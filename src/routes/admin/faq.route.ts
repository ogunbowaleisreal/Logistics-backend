import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createFAQ,
  getFAQs,
  updateFAQ,
  deleteFAQ,
} from "../../controllers/admin/faq.controller";

const router = Router();

router
  .route("")
  .post(adminVerification, createFAQ)
  .get(adminVerification, getFAQs)
  .patch(adminVerification, updateFAQ)
  .delete(adminVerification, deleteFAQ);

export default router;
