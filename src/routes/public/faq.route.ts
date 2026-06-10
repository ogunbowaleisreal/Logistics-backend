import { Router } from "express";
import { getFAQs } from "../../controllers/public/faq.controller";

const router = Router();

router.get("", getFAQs);

export default router;
