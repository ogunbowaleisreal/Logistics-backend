import express from "express";
import {
  createFAQCategory,
  getFAQCategories,
  updateFAQCategory,
  createFAQ,
  getFAQs,
  updateFAQ,
  deleteFAQ,
} from "../../controllers/business/faq.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router
  .route("/categories")
  .post(staffRoleVerification("CRTFAQ"), createFAQCategory)
  .get(staffRoleVerification("GETFAQS"), getFAQCategories)
  .patch(staffRoleVerification("UPTFAQ"), updateFAQCategory);

router
  .route("/")
  .post(staffRoleVerification("CRTFAQ"), createFAQ)
  .get(staffRoleVerification("GETFAQS"), getFAQs)
  .patch(staffRoleVerification("UPTFAQ"), updateFAQ)
  .delete(staffRoleVerification("DELFAQ"), deleteFAQ);

export default router;
