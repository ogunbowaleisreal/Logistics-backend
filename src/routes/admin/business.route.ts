import { Router } from "express";
import {
  deleteBusiness,
  getBusinesses,
  suspendBusiness,
} from "../../controllers/admin/business.controller";
import { roleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("")
  .get(roleVerification("GETBUSINESS"), getBusinesses)
  .patch(roleVerification("SUSPBUSINESS"), suspendBusiness)
  .delete(roleVerification("DELBUSINESS"), deleteBusiness);

export default router;
