import { Router } from "express";
import {
  getFAQCategories,
  getFAQs,
} from "../../controllers/client/faq.controller";

const router = Router();

router.get("/categories", getFAQCategories);
router.get("", getFAQs);

export default router;
