import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createGeneralFAQ,
  getGeneralFAQs,
  updateGeneralFAQ,
  deleteGeneralFAQ,
} from "../../controllers/admin/generalFaq.controller";

const router = Router();

router
  .route("")
  .post(adminVerification, createGeneralFAQ)
  .get(adminVerification, getGeneralFAQs)
  .patch(adminVerification, updateGeneralFAQ)
  .delete(adminVerification, deleteGeneralFAQ);

export default router;
