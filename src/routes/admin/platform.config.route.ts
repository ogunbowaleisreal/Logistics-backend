import { Router } from "express";
import {
    getPlatformConfig,
    updatePlatformConfig,
} from "../../controllers/admin/platformConfigController";
import { roleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
    .route("")
    .get(roleVerification("GETPLATFORMCFG"), getPlatformConfig)
    .patch(roleVerification("UPTPLATFORMCFG"), updatePlatformConfig);

export default router;