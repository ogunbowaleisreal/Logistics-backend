import { Router } from "express";
import { getSubcategories } from "../../controllers/client/subcategory.controller";

const router = Router();

router.get("", getSubcategories);

export default router;
