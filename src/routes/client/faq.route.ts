import { Router } from "express";
import { getFAQs } from "../../controllers/client/faq.controller";

const router = Router();

router.get("", getFAQs);

export default router;
