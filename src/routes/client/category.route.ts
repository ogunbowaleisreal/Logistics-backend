import { Router } from "express";
import {
  createCategory,
  getCategories,
} from "../../controllers/client/category.controller";

const router = Router();

router.route("").get(getCategories);

export default router;
