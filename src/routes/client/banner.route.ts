import { Router } from "express";
import { getDefaultBanners } from "../../controllers/client/banner.controller";

const router = Router();

router.get("/default", getDefaultBanners);

export default router;
